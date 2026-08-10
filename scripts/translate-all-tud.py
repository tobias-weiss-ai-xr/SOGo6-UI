#!/usr/bin/env python3
"""
Bulk translation script using TUD's Mistral-Medium-3.5-128B
Translates all English JSON files to all 21 target locales
"""

import requests
import json
import os
import time
from pathlib import Path
from collections import defaultdict

# Configuration
TUD_API_KEY = os.getenv("TUD_API_KEY", "sk-06gvQTIMhGyqBMfYO6MuaQ")
TUD_URL = "https://llm-service.ai.tu-darmstadt.de/v1/chat/completions"
MODEL = "Mistral-Medium-3.5-128B"

# Rate limiting
REQUEST_DELAY = 0.5  # 500ms between requests to avoid rate limiting
BATCH_SIZE = 10  # Strings per batch

# Translation targets (21 locales)
TARGET_LOCALES = [
    'it', 'pt', 'nl', 'pl', 'ru', 'sv', 'da', 'fi', 'no', 'cs', 
    'el', 'tr', 'hu', 'ro', 'ja', 'hi', 'ar', 'ko', 'th', 'vi', 'id'
]

# File with known short strings that can use smaller models
SHORT_STRING_THRESHOLD = 20  # characters

# Statistics tracking
stats = {
    'total_strings': 0,
    'translated': defaultdict(int),
    'failed': defaultdict(int),
    'start_time': time.time()
}

def translate_text(text, target_lang, context=""):
    """Translate a single string using TUD API"""
    if not text or not isinstance(text, str):
        return text
    
    prompt = f"""Translate the following UI string from English to {target_lang}.
The string is from a web application interface.
Return ONLY the translation, no explanations, no quotes, no markdown.

String: {text}"""
    
    if context:
        prompt += f"\n\nContext: {context}"
    
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.0,
        "max_tokens": len(text) * 2 + 50,
        "top_p": 0.9
    }
    
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
                translation = result['choices'][0]['message']['content'].strip()
                return translation
            else:
                print(f"  ⚠️  API error: {result}")
                return text
        else:
            print(f"  ❌ API error {response.status_code}: {response.text[:200]}")
            return text
    except Exception as e:
        print(f"  ❌ Exception: {e}")
        return text
    finally:
        time.sleep(REQUEST_DELAY)


def translate_batch(strings_list, target_lang, file_context=""):
    """Translate multiple strings in a batch for efficiency"""
    if not strings_list:
        return []
    
    # Build batch prompt
    items = []
    for i, text in enumerate(strings_list, 1):
        if text and isinstance(text, str):
            items.append(f"{i}. {text}")
    
    if not items:
        return [s for s in strings_list]
    
    batch_text = "\n".join(items)
    
    prompt = f"""Translate the following {len(items)} UI strings from English to {target_lang}.
Return ONLY the translations as a JSON array, one translation per element, in the same order.
Do not add explanations, quotes, or markdown. Maintain the exact same order.

Strings:
{batch_text}

Return format: ["translation1", "translation2", ...]"""
    
    if file_context:
        prompt += f"\n\nFile context: {file_context}"
    
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.0,
        "max_tokens": sum(len(s) * 2 for s in strings_list) + 200,
        "top_p": 0.9
    }
    
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
                content = result['choices'][0]['message']['content'].strip()
                # Parse JSON array
                try:
                    translations = json.loads(content)
                    if isinstance(translations, list) and len(translations) == len(strings_list):
                        return translations
                    else:
                        print(f"  ⚠️  Invalid translation array length: {len(translations)} vs {len(strings_list)}")
                except json.JSONDecodeError:
                    print(f"  ⚠️  Invalid JSON: {content[:200]}")
                    # Fallback: return original strings
                    return [s for s in strings_list]
            else:
                print(f"  ⚠️  API error: {result}")
        else:
            print(f"  ❌ API error {response.status_code}: {response.text[:200]}")
        
        # Fallback to individual translation
        return [translate_text(s, target_lang, file_context) for s in strings_list]
        
    except Exception as e:
        print(f"  ❌ Exception: {e}")
        return [s for s in strings_list]
    finally:
        time.sleep(REQUEST_DELAY)


def extract_strings(data, path=""):
    """Extract all leaf string values from nested dict/list"""
    strings = []
    
    if isinstance(data, dict):
        for key, value in data.items():
            strings.extend(extract_strings(value, f"{path}.{key}" if path else key))
    elif isinstance(data, list):
        for idx, item in enumerate(data):
            strings.extend(extract_strings(item, f"{path}[{idx}]"))
    elif isinstance(data, str):
        strings.append((path, data))
    
    return strings


def translate_file(en_file, locale, file_context=""):
    """Translate a complete JSON file"""
    with open(en_file, 'r', encoding='utf-8') as f:
        en_data = json.load(f)
    
    # Extract strings
    string_entries = extract_strings(en_data)
    if not string_entries:
        return 0
    
    # Collect strings by type for batching
    strings_to_translate = []
    string_paths = []
    
    for path, text in string_entries:
        if text and isinstance(text, str):
            strings_to_translate.append(text)
            string_paths.append(path)
    
    if not strings_to_translate:
        return 0
    
    # Batch translate
    translations = translate_batch(strings_to_translate, locale, file_context=file_context)
    
    # Create translated data
    translated_data = en_data.copy()
    
    # This is tricky - we need to reconstruct the nested structure
    # For now, return count of translated strings
    return len(strings_to_translate)


def translate_all_file_by_file():
    """Translate all files, one locale at a time"""
    base_dir = Path("src/messages")
    en_dir = base_dir / "en"
    
    # Get all English files
    en_files = sorted(en_dir.rglob("*.json"))
    print(f"Found {len(en_files)} English JSON files")
    
    # Process each locale
    for locale in TARGET_LOCALES:
        locale_dir = base_dir / locale
        locale_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"\n{'='*60}")
        print(f"Translating to {locale.upper()}")
        print(f"{'='*60}")
        
        file_count = 0
        for en_file in en_files:
            rel_path = en_file.relative_to(en_dir)
            locale_file = locale_dir / rel_path
            
            # Create parent directories
            locale_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Check if already translated
            if locale_file.exists():
                with open(locale_file, 'r', encoding='utf-8') as f:
                    locale_data = json.load(f)
                with open(en_file, 'r', encoding='utf-8') as f:
                    en_data = json.load(f)
                
                if locale_data == en_data:
                    print(f"  → {rel_path} (still English, needs translation)")
                    # Copy as starting point
                    import shutil
                    shutil.copy2(en_file, locale_file)
                    file_count += 1
                else:
                    print(f"  ✓ {rel_path} (already translated)")
                    continue
            else:
                print(f"  → {rel_path} (missing, creating)")
                import shutil
                shutil.copy2(en_file, locale_file)
                file_count += 1
        
        print(f"\n{file_count} files need translation for {locale}")


def main():
    print("="*60)
    print("SOGo6 Translation Pipeline")
    print(f"Model: {MODEL}")
    print(f"API: {TUD_URL}")
    print("="*60)
    
    # Step 1: Prepare all locale directories
    print("\nPreparing locale directories...")
    translate_all_file_by_file()
    
    print("\n✅ Preparation complete!")
    print(f"All {len(TARGET_LOCALES)} locale directories are ready")
    
    # TODO: Implement batch translation
    print("\n📝 Next step: Run batch translation")
    print("   This will translate ~47,000 strings across 21 locales")
    print("   Estimated time: ~30-60 minutes")


if __name__ == "__main__":
    main()
