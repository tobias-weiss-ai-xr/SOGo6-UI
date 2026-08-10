#!/usr/bin/env python3
"""
Extract all unique English strings for translation.
Creates a CSV file that can be sent to translators or translation services.
"""
import json, csv
from pathlib import Path

EN_DIR = Path(__file__).parent.parent / "src" / "messages" / "en"
OUTPUT_DIR = Path(__file__).parent

all_strings = set()
file_map = {}  # filename -> set of strings

def extract_strings(obj, strings_set):
    """Recursively extract all 'string' values from JSON structure."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == "string" and isinstance(v, str):
                strings_set.add(v)
            else:
                extract_strings(v, strings_set)
    elif isinstance(obj, list):
        for item in obj:
            extract_strings(item, strings_set)

def process_file(filepath):
    """Process a single JSON file."""
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    strings = set()
    extract_strings(data, strings)
    all_strings.update(strings)
    
    rel_path = str(filepath.relative_to(EN_DIR))
    file_map[rel_path] = strings
    
    return len(strings)

print("🔍 Extracting all English strings...")

total_files = 0
file_counts = {}

for f in sorted(EN_DIR.glob("**/*.json")):
    count = process_file(f)
    rel = str(f.relative_to(EN_DIR))
    file_counts[rel] = count
    total_files += 1

print(f"✅ Processed {total_files} files")
print(f"📊 Found {len(all_strings)} unique strings")
print()

# Sort strings alphabetically
sorted_strings = sorted(all_strings)

# Create CSV output
csv_path = OUTPUT_DIR / "all-english-strings.csv"
with open(csv_path, "w", encoding="utf-8", newline="") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["ID", "English", "Category", "Notes"])
    
    for i, s in enumerate(sorted_strings, 1):
        # Try to categorize
        category = "other"
        s_lower = s.lower()
        
        if "mail" in s_lower or "email" in s_lower or "message" in s_lower:
            category = "mail"
        elif "calendar" in s_lower or "event" in s_lower or "meeting" in s_lower:
            category = "calendar"
        elif "contact" in s_lower or "address" in s_lower:
            category = "contacts"
        elif "task" in s_lower:
            category = "tasks"
        elif "error" in s_lower or "fail" in s_lower or "warning" in s_lower:
            category = "errors"
        elif "setting" in s_lower or "config" in s_lower:
            category = "settings"
        elif "save" in s_lower or "cancel" in s_lower or "delete" in s_lower or "edit" in s_lower:
            category = "actions"
        elif "user" in s_lower or "login" in s_lower or "password" in s_lower:
            category = "auth"
        elif "step" in s_lower or len(s.split()) > 3:
            category = "sentences"
        
        writer.writerow([i, f'"{s}"', category, ""])

print(f"📁 Saved to: {csv_path.resolve()}")
print()

# Create file breakdown
breakdown_path = OUTPUT_DIR / "string-breakdown.txt"
with open(breakdown_path, "w", encoding="utf-8") as f:
    f.write("STRING BREAKDOWN BY FILE\n")
    f.write("=" * 50 + "\n\n")
    f.write(f"Total files: {total_files}\n")
    f.write(f"Total unique strings: {len(all_strings)}\n\n")
    
    # Sort by count
    sorted_files = sorted(file_counts.items(), key=lambda x: x[1], reverse=True)
    
    for rel, count in sorted_files:
        f.write(f"{count:4d}  {rel}\n")

print(f"📁 Breakdown saved to: {breakdown_path.resolve()}")
print()

# Create summary
summary_path = OUTPUT_DIR / "TRANSLATION-SUMMARY.md"
with open(summary_path, "w", encoding="utf-8") as f:
    f.write("# Translation Summary\n\n")
    f.write(f"- **Total unique English strings**: {len(all_strings)}\n")
    f.write(f"- **Total JSON files**: {total_files}\n")
    f.write(f"- **Target locales**: 25\n")
    f.write(f"- **Total translations needed**: {len(all_strings) * 25:,}\n\n")
    f.write("## Next Steps\n\n")
    f.write("1. **Send `all-english-strings.csv` to translators**\n")
    f.write("2. **Each translator adds their language column** to the CSV\n")
    f.write("3. **Run `import-translations.py`** to apply translations to JSON files\n\n")
    f.write("## Translation Services Options\n\n")
    f.write("- **Google Cloud Translation**: ~$20 per million characters\n")
    f.write("- **DeepL**: ~€20-50 per million characters\n")
    f.write("- **POEditor**: Crowdsourced/commercial platform\n")
    f.write("- **Crowdin**: Another popular option\n")
    f.write("- **Localazy**: Free tier available\n\n")
    f.write(f"**Estimated cost** for Google Translate: ~${(len(all_strings) * 40 * 0.00002):.2f} (40 chars avg × $0.00002/char × 21 locales)\n")

print(f"📁 Summary saved to: {summary_path.resolve()}")
print()
print("✨ Done! Files ready for translation:")
print(f"   - {csv_path.name}")
print(f"   - {breakdown_path.name}")
print(f"   - {summary_path.name}")
