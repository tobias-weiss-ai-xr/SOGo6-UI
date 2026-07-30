#!/usr/bin/env python3
"""
Bulk translate all files for a single locale using TUD Mistral-Medium-3.5-128B
"""

import requests
import json
import os
import sys
import time
import copy
from pathlib import Path

# Configuration
TUD_API_KEY = os.getenv("TUD_API_KEY", "sk-06gvQTIMhGyqBMfYO6MuaQ")
TUD_URL = "https://llm-service.ai.tu-darmstadt.de/v1/chat/completions"
MODEL = "Mistral-Medium-3.5-128B"

# Rate limiting
REQUEST_DELAY = 1.0  # 1 second between API calls
BATCH_SIZE = 20  # Strings per batch

# Language info
LANG_NAMES = {
    'it': 'Italian', 'pt': 'Portuguese (European)', 'nl': 'Dutch', 
    'pl': 'Polish', 'ru': 'Russian', 'sv': 'Swedish', 'da': 'Danish', 
    'fi': 'Finnish', 'no': 'Norwegian', 'cs': 'Czech', 'el': 'Greek', 
    'tr': 'Turkish', 'hu': 'Hungarian', 'ro': 'Romanian', 
    'ja': 'Japanese', 'hi': 'Hindi', 'ar': 'Arabic', 
    'ko': 'Korean', 'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian',
    'zh': 'Chinese (Simplified)', 'de': 'German', 'fr': 'French', 'es': 'Spanish'
}

stats = {
    'api_calls': 0,
    'strings_translated': 0,
    'files_processed': 0,
    'errors': 0
}


def extract_json_from_content(content):
    """Extract JSON from content, stripping markdown code blocks"""
    import re
    # Remove markdown code blocks
    content = re.sub(r'^```(json)?\s*', '', content, flags=re.MULTILINE)
    content = re.sub(r'```\s*$', '', content, flags=re.MULTILINE)
    content = content.strip()
    return content


def call_tud(prompt, max_tokens=4000):
    """Call TUD API with retry logic"""
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.0,
        "max_tokens": max_tokens,
        "top_p": 0.9
    }
    
    for attempt in range(3):
        try:
            response = requests.post(
                TUD_URL,
                headers={"Authorization": f"Bearer {TUD_API_KEY}", "Content-Type": "application/json"},
                json=payload,
                timeout=120
            )
            
            if response.status_code == 200:
                stats['api_calls'] += 1
                content = response.json()['choices'][0]['message']['content'].strip()
                # Extract JSON from markdown if needed
                return extract_json_from_content(content)
            elif response.status_code == 429:
                wait = 2 ** attempt
                print(f"    Rate limited, waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"    API error {response.status_code}: {response.text[:100]}")
                return None
        except Exception as e:
            print(f"    Exception (attempt {attempt+1}): {e}")
            if attempt == 2:
                return None
            time.sleep(2)
    return None


def extract_strings(data, path=""):
    """Extract all {string: value} pairs from nested structure"""
    strings = []
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, dict) and 'string' in value:
                full_path = f"{path}.{key}.string" if path else f"{key}.string"
                strings.append((full_path, value['string']))
            else:
                strings.extend(extract_strings(value, f"{path}.{key}" if path else key))
    elif isinstance(data, list):
        for idx, item in enumerate(data):
            strings.extend(extract_strings(item, f"{path}[{idx}]"))
    return strings


def apply_translations(data, translations, current_path=""):
    """Apply translations to nested structure"""
    if isinstance(data, dict):
        for key, value in data.items():
            full_path = f"{current_path}.{key}.string" if current_path else f"{key}.string"
            if full_path in translations:
                if isinstance(value, dict) and 'string' in value:
                    data[key]['string'] = translations[full_path]
            else:
                apply_translations(value, translations, f"{current_path}.{key}" if current_path else key)
    elif isinstance(data, list):
        for idx, item in enumerate(data):
            apply_translations(item, translations, f"{current_path}[{idx}]")


def translate_file(en_file, target_lang):
    """Translate a single JSON file"""
    with open(en_file, 'r', encoding='utf-8') as f:
        en_data = json.load(f)
    
    # Get file context for better translations
    rel_path = en_file.relative_to(Path("src/messages/en"))
    file_context = str(rel_path).replace('/', ' / ')
    
    # Extract strings
    texts = extract_strings(en_data)
    
    if not texts:
        print(f"    No strings found in {rel_path}")
        return en_data
    
    # Split into batches
    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i:i+BATCH_SIZE]
        
        # Build prompt
        prompt_parts = []
        for path, text in batch:
            # Use full path including .string
            prompt_parts.append(f"{path}: {text}")
        
        lang_name = LANG_NAMES.get(target_lang, target_lang)
        prompt = f"""You are a professional UI translator translating from English to {lang_name}.
Translate the following strings, maintaining the original meaning, tone, and technical accuracy.
Return ONLY a JSON object with the EXACT same paths as keys and translations as values.

{chr(10).join(prompt_parts)}

Return format: {{'path1': 'translation1', 'path2': 'translation2', ...}}"""
        
        response = call_tud(prompt)
        
        if response:
            try:
                translations = json.loads(response)
                apply_translations(en_data, translations)
                stats['strings_translated'] += len(batch)
                print(f"    ✓ Batch {i//BATCH_SIZE + 1}: {len(batch)} strings")
            except json.JSONDecodeError:
                print(f"    ⚠️  Failed to parse response (batch {i//BATCH_SIZE + 1})")
                stats['errors'] += 1
        else:
            print(f"    ❌ API failed for batch {i//BATCH_SIZE + 1}")
            stats['errors'] += 1
        
        time.sleep(REQUEST_DELAY)
    
    return en_data


def needs_translate(en_file, locale_file):
    """Check if file still has English content"""
    if not locale_file.exists():
        return True
    
    with open(en_file, 'r', encoding='utf-8') as f:
        en_data = json.load(f)
    with open(locale_file, 'r', encoding='utf-8') as f:
        locale_data = json.load(f)
    
    return en_data == locale_data


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 bulk-translate-tud-file.py <locale>")
        sys.exit(1)
    
    target_lang = sys.argv[1]
    
    if target_lang not in LANG_NAMES:
        print(f"Unknown locale: {target_lang}")
        print(f"Available: {', '.join(LANG_NAMES.keys())}")
        sys.exit(1)
    
    print(f"Translating all files for: {target_lang.upper()} ({LANG_NAMES[target_lang]})")
    print("-" * 60)
    
    base_dir = Path("src/messages")
    en_dir = base_dir / "en"
    locale_dir = base_dir / target_lang
    locale_dir.mkdir(parents=True, exist_ok=True)
    
    # Process all files
    en_files = sorted(en_dir.rglob("*.json"))
    processed = 0
    
    for en_file in en_files:
        rel_path = en_file.relative_to(en_dir)
        locale_file = locale_dir / rel_path
        locale_file.parent.mkdir(parents=True, exist_ok=True)
        
        if needs_translate(en_file, locale_file):
            print(f"  Processing: {rel_path}")
            
            try:
                # Ensure locale file exists (copy English as base)
                if not locale_file.exists():
                    import shutil
                    shutil.copy2(en_file, locale_file)
                
                # Translate
                translated_data = translate_file(en_file, target_lang)
                
                # Save
                with open(locale_file, 'w', encoding='utf-8') as f:
                    json.dump(translated_data, f, indent=2, ensure_ascii=False)
                
                stats['files_processed'] += 1
                print(f"  ✅ Saved: {rel_path}")
                
            except Exception as e:
                print(f"  ❌ Error with {rel_path}: {e}")
                stats['errors'] += 1
                # Ensure file exists
                import shutil
                shutil.copy2(en_file, locale_file)
        else:
            print(f"  ✓ Already translated: {rel_path}")
    
    # Summary
    print("\n" + "=" * 60)
    print(f"Locale {target_lang.upper()} Summary:")
    print(f"  Files processed: {stats['files_processed']}")
    print(f"  Strings translated: {stats['strings_translated']}")
    print(f"  API calls: {stats['api_calls']}")
    print(f"  Errors: {stats['errors']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
