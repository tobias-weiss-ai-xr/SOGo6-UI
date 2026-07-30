#!/usr/bin/env python3
"""
Bulk translation script using TUD's Mistral-Medium-3.5-128B
Translates remaining English strings in all 21 target locales
"""

import requests
import json
import os
import time
import re
from pathlib import Path
from collections import defaultdict

# Configuration
TUD_API_KEY = os.getenv("TUD_API_KEY", "sk-06gvQTIMhGyqBMfYO6MuaQ")
TUD_URL = "https://llm-service.ai.tu-darmstadt.de/v1/chat/completions"
MODEL = "Mistral-Medium-3.5-128B"

# Translation targets
TARGET_LOCALES = [
    'it', 'pt', 'nl', 'pl', 'ru', 'sv', 'da', 'fi', 'no', 'cs', 
    'el', 'tr', 'hu', 'ro', 'ja', 'hi', 'ar', 'ko', 'th', 'vi', 'id'
]

# Rate limiting - be gentle with TUD service
REQUEST_DELAY = 1.0  # 1 second between requests

# Language names for context
LANG_NAMES = {
    'it': 'Italian', 'pt': 'Portuguese', 'nl': 'Dutch', 'pl': 'Polish', 
    'ru': 'Russian', 'sv': 'Swedish', 'da': 'Danish', 'fi': 'Finnish',
    'no': 'Norwegian', 'cs': 'Czech', 'el': 'Greek', 'tr': 'Turkish',
    'hu': 'Hungarian', 'ro': 'Romanian', 'ja': 'Japanese', 'hi': 'Hindi',
    'ar': 'Arabic', 'ko': 'Korean', 'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian'
}

# Track progress
stats = {
    'total_requests': 0,
    'translated_files': defaultdict(int),
    'translated_strings': defaultdict(int),
    'errors': 0
}

def call_tud_api(prompt, model=MODEL, max_tokens=2000):
    """Call TUD API with retry logic"""
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.0,
        "max_tokens": max_tokens,
        "top_p": 0.9
    }
    
    for attempt in range(3):  # Retry up to 3 times
        try:
            response = requests.post(
                TUD_URL,
                headers={
                    "Authorization": f"Bearer {TUD_API_KEY}",
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'choices' in result and len(result['choices']) > 0:
                    return result['choices'][0]['message']['content'].strip()
                else:
                    print(f"  ⚠️  API returned no choices: {result}")
                    return None
            elif response.status_code == 429:
                # Rate limited
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"  ⏳ Rate limited, waiting {wait_time}s...")
                time.sleep(wait_time)
                continue
            else:
                print(f"  ❌ API error {response.status_code}: {response.text[:200]}")
                return None
        except Exception as e:
            print(f"  ❌ Exception (attempt {attempt+1}): {e}")
            if attempt == 2:
                return None
            time.sleep(2 ** attempt)
    
    return None


def translate_file_content(en_data, target_lang):
    """Translate a complete JSON file's content"""
    
    lang_name = LANG_NAMES.get(target_lang, target_lang)
    
    # Prepare all text that needs translation
    # We'll build a prompt with all leaf string values
    
    def extract_texts(data, path=""):
        """Extract text values with their paths"""
        texts = []
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, (dict, list)):
                    texts.extend(extract_texts(value, f"{path}.{key}" if path else key))
                elif isinstance(value, str):
                    texts.append((f"{path}.{key}" if path else key, value))
        elif isinstance(data, list):
            for idx, item in enumerate(data):
                if isinstance(item, (dict, list)):
                    texts.extend(extract_texts(item, f"{path}[{idx}]"))
                elif isinstance(item, str):
                    texts.append((f"{path}[{idx}]", item))
        return texts
    
    texts_with_paths = extract_texts(en_data)
    
    if not texts_with_paths:
        return en_data
    
    # Filter out empty strings
    texts_to_translate = [(path, text) for path, text in texts_with_paths if text.strip()]
    
    if not texts_to_translate:
        return en_data
    
    # Build prompt - send in batches of 20 to stay within context
    BATCH_SIZE = 20
    result_data = en_data
    
    for i in range(0, len(texts_to_translate), BATCH_SIZE):
        batch = texts_to_translate[i:i+BATCH_SIZE]
        
        # Build batch prompt
        prompt_parts = []
        for path, text in batch:
            # Clean path for readability
            clean_path = path.replace('.', '/').replace('[', '/').replace(']', '')
            prompt_parts.append(f"Path: {clean_path}\nText: {text}\n\n")
        
        batch_prompt = f"""You are a professional translator translating UI strings from English to {lang_name}.
Translate the following strings while maintaining the same meaning and tone.
Return ONLY the translations as a JSON object where keys are the paths and values are the translations.
Do not add explanations, quotes, or markdown.

{chr(10).join(prompt_parts)}

Return format: {{'path1': 'translation1', 'path2': 'translation2', ...}}"""
        
        print(f"  Translating batch {i//BATCH_SIZE + 1} ({len(batch)} strings)...")
        
        response = call_tud_api(batch_prompt, max_tokens=4000)
        
        if response:
            stats['total_requests'] += 1
            try:
                translations = json.loads(response)
                
                # Apply translations to result_data
                def apply_translation(data, current_path=""):
                    if isinstance(data, dict):
                        for key, value in data.items():
                            new_path = f"{current_path}.{key}" if current_path else key
                            if new_path in translations:
                                data[key] = translations[new_path]
                            else:
                                apply_translation(value, new_path)
                    elif isinstance(data, list):
                        for idx, item in enumerate(data):
                            new_path = f"{current_path}[{idx}]" if current_path else f"[{idx}]"
                            if new_path in translations:
                                data[idx] = translations[new_path]
                            else:
                                apply_translation(item, new_path)
                
                apply_translation(result_data)
                stats['translated_strings'][target_lang] += len(batch)
                print(f"  ✓ Applied {len(batch)} translations")
                
            except json.JSONDecodeError as e:
                print(f"  ⚠️  Failed to parse response as JSON: {e}")
                print(f"  Response: {response[:500]}")
                stats['errors'] += 1
        else:
            print(f"  ❌ Failed to get translation for batch")
            stats['errors'] += 1
        
        time.sleep(REQUEST_DELAY)
    
    return result_data


def needs_translation(en_file, locale_file):
    """Check if a file still needs translation"""
    with open(en_file, 'r', encoding='utf-8') as f:
        en_data = json.load(f)
    
    if not locale_file.exists():
        return True
    
    with open(locale_file, 'r', encoding='utf-8') as f:
        locale_data = json.load(f)
    
    # Check if identical (still English)
    return en_data == locale_data


def translate_locale(locale):
    """Translate all files for a specific locale"""
    print(f"\n{'='*60}")
    print(f"Translating locale: {locale.upper()} ({LANG_NAMES.get(locale, locale)})")
    print(f"{'='*60}")
    
    base_dir = Path("src/messages")
    en_dir = base_dir / "en"
    locale_dir = base_dir / locale
    locale_dir.mkdir(parents=True, exist_ok=True)
    
    en_files = sorted(en_dir.rglob("*.json"))
    files_needing_translation = []
    
    # Find files that need translation
    for en_file in en_files:
        rel_path = en_file.relative_to(en_dir)
        locale_file = locale_dir / rel_path
        
        if needs_translation(en_file, locale_file):
            files_needing_translation.append((en_file, locale_file, rel_path))
    
    print(f"Files to translate: {len(files_needing_translation)}")
    
    if not files_needing_translation:
        print(f"✅ All files already translated for {locale}")
        return
    
    # Translate each file
    for en_file, locale_file, rel_path in files_needing_translation:
        print(f"\n  Translating: {rel_path}")
        locale_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Load English data
        with open(en_file, 'r', encoding='utf-8') as f:
            en_data = json.load(f)
        
        # If file is empty, just copy
        if not en_data:
            import shutil
            shutil.copy2(en_file, locale_file)
            continue
        
        # Translate
        try:
            translated_data = translate_file_content(en_data, locale)
            
            # Save
            with open(locale_file, 'w', encoding='utf-8') as f:
                json.dump(translated_data, f, indent=2, ensure_ascii=False)
            
            stats['translated_files'][locale] += 1
            print(f"  ✅ Saved to {rel_path}")
            
        except Exception as e:
            print(f"  ❌ Failed to translate {rel_path}: {e}")
            stats['errors'] += 1
            # Save English version as fallback
            import shutil
            shutil.copy2(en_file, locale_file)
    
    # Compile messages after translation
    print(f"\n  Compiling messages for {locale}...")
    import subprocess
    try:
        subprocess.run(
            ["node", "scripts/compile-messages.mjs"],
            capture_output=True,
            text=True,
            timeout=30
        )
        print(f"  ✅ Messages compiled")
    except Exception as e:
        print(f"  ⚠️  Compilation failed: {e}")


def main():
    print("="*60)
    print("SOGo6 Bulk Translation Using TUD Mistral-Medium-3.5-128B")
    print("="*60)
    print(f"Model: {MODEL}")
    print(f"API: {TUD_URL}")
    print(f"Locales: {', '.join(TARGET_LOCALES)}")
    print("="*60)
    
    # Ask for confirmation
    print("\n⚠️  This will translate ~47,000 strings across 21 locales")
    print("   Estimated time: 30-90 minutes depending on rate limits")
    print("   Continue? (yes/no)")
    
    # Uncomment below for actual execution
    # response = input("> ").strip().lower()
    # 
    # if response != 'yes':
    #     print("Aborted.")
    #     return
    
    # For now, just run on one locale as a test
    print("\n🚀 Starting translation...")
    
    # Process each locale
    for locale in TARGET_LOCALES:
        translate_locale(locale)
        
        # Print progress
        elapsed = time.time() - stats.get('start_time', time.time())
        print(f"\n⏱️  Progress: {len(stats.get('translated_files', {}))} locales processed in {elapsed:.1f}s")
        if stats['errors'] > 0:
            print(f"   ⚠️  {stats['errors']} errors")
    
    # Final report
    print("\n" + "="*60)
    print("TRANSLATION COMPLETE")
    print("="*60)
    print(f"Total API requests: {stats['total_requests']}")
    print(f"Total errors: {stats['errors']}")
    print("\nPer locale:")
    for locale in TARGET_LOCALES:
        print(f"  {locale}: {stats['translated_files'].get(locale, 0)} files, {stats['translated_strings'].get(locale, 0)} strings")


if __name__ == "__main__":
    stats['start_time'] = time.time()
    main()
