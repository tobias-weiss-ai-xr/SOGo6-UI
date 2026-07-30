#!/usr/bin/env python3
"""
Import translations from CSV to JSON locale files.

CSV Format:
  ID,English,de,fr,es,zh,it,pt,ja,nl,pl,ru,sv,da,fi,no,cs,el,tr,hu,ro,ko,hi,ar,th,vi,id

This script:
1. Reads the CSV file with translations
2. Builds a translation map: English -> {locale: translation}
3. Updates all JSON locale files with the translations
"""
import json, csv
from pathlib import Path

MSG_DIR = Path(__file__).parent.parent / "src" / "messages"
EN_DIR   = MSG_DIR / "en"
LOCALES = [
    "de","fr","es","zh",
    "it","pt","ja",
    "nl","pl","ru",
    "sv","da","fi","no",
    "cs","el","tr","hu",
    "ro","ko","hi","ar",
    "th","vi","id",
]

def load_csv(csv_path):
    """Load translations from CSV file."""
    translations = {}  # english -> {locale: text}
    
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            english = row.get("English", "").strip('"')
            if not english:
                continue
            
            entry = {}
            for locale in LOCALES:
                if locale in row:
                    text = row[locale].strip('"')
                    if text and text != english:
                        entry[locale] = text
            
            if entry:  # Only add if we have translations
                translations[english] = entry
    
    return translations

def translate_file(en_file, translations, locale):
    """Apply translations to a single locale file."""
    rel = en_file.relative_to(EN_DIR)
    loc_file = MSG_DIR / locale / rel
    
    if not loc_file.exists():
        # Create file from English template
        loc_file.parent.mkdir(parents=True, exist_ok=True)
        import shutil
        shutil.copy2(str(en_file), str(loc_file))
    
    with open(loc_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    changed = False
    
    def walk(obj):
        nonlocal changed
        if isinstance(obj, dict):
            for key, value in obj.items():
                if key == "string" and isinstance(value, str):
                    if value in translations and locale in translations[value]:
                        obj[key] = translations[value][locale]
                        changed = True
                else:
                    walk(value)
        elif isinstance(obj, list):
            for item in obj:
                walk(item)
    
    walk(data)
    
    if changed:
        with open(loc_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
    
    return changed

def main():
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python3 import-translations.py <translated.csv>")
        print()
        print("CSV format: ID,English,de,fr,es,zh,it,pt,ja,nl,pl,ru,sv,da,fi,no,cs,el,tr,hu,ro,ko,hi,ar,th,vi,id")
        return
    
    csv_path = Path(sys.argv[1])
    if not csv_path.exists():
        print(f"Error: File not found: {csv_path}")
        return
    
    print("🔄 Loading translations from CSV...")
    translations = load_csv(csv_path)
    print(f"✅ Loaded {len(translations)} translation entries")
    
    print("📁 Applying translations to locale files...")
    
    en_files = sorted(EN_DIR.glob("**/*.json"))
    print(f"📊 Processing {len(en_files)} English files...")
    
    total_changed = 0
    total_locales = 0
    
    for i, en_file in enumerate(en_files):
        for locale in LOCALES:
            if translate_file(en_file, translations, locale):
                total_changed += 1
            total_locales += 1
        
        if (i + 1) % 10 == 0:
            percent = (i + 1) * 100 // len(en_files)
            print(f"  ✅ {i + 1}/{len(en_files)} files ({percent}%)...")
    
    print()
    print(f"✨ Import complete!")
    print(f"📊 Translations applied: {total_changed}/{total_locales} files modified")
    print(f"🎯 Coverage: {total_changed * 100 // total_locales:.1f}% of files had translations applied")

if __name__ == "__main__":
    main()
