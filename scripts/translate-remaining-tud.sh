#!/bin/bash
# Translation script using TUD service
# This script translates all remaining English strings across all 21 locales

set -e

cd "$(dirname "$0")/.."

echo "=========================================="
echo "SOGo6 Translation Pipeline"
echo "Using: TUD Mistral-Medium-3.5-128B"
echo "Target: 21 locales, ~47,000 strings"
echo "=========================================="

# Check API key
export TUD_API_KEY=${TUD_API_KEY:-sk-06gvQTIMhGyqBMfYO6MuaQ}

# Create locales list
LOCALES=("it" "pt" "nl" "pl" "ru" "sv" "da" "fi" "no" "cs" "el" "tr" "hu" "ro" "ja" "hi" "ar" "ko" "th" "vi" "id")

# Count strings to translate
echo ""
echo "Analyzing translation needs..."
TOTAL_STRINGS=0
TOTAL_FILES=0

for LOCALE in "${LOCALES[@]}"; do
    COUNT=$(python3 -c "
import json
from pathlib import Path

en_dir = Path('src/messages/en')
locale_dir = Path('src/messages/$LOCALE')
count = 0
files = 0

for en_file in en_dir.rglob('*.json'):
    rel_path = en_file.relative_to(en_dir)
    locale_file = locale_dir / rel_path
    
    with open(en_file) as f:
        en_data = json.load(f)
    
    if not locale_file.exists():
        files += 1
        count += 10  # estimate
    else:
        with open(locale_file) as f:
            locale_data = json.load(f)
        if en_data == locale_data:
            files += 1
            count += 10

print(files)
" 2>/dev/null || echo 0)
    TOTAL_FILES=$((TOTAL_FILES + COUNT / 10))
    TOTAL_STRINGS=$((TOTAL_STRINGS + COUNT))
done

echo "Estimated: $TOTAL_STRINGS strings across $TOTAL_FILES files need translation"

# Ask for confirmation
echo ""
echo "This will make ~$TOTAL_STRINGS API calls to TUD service."
echo "Estimated time: ${TOTAL_STRINGS}s (at 1 call/second) = $((TOTAL_STRINGS / 60)) minutes"
echo ""
read -p "Continue? (yes/no): " -r

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]?$ ]]; then
    echo "Aborted."
    exit 1
fi

# Run translation for each locale
for LOCALE in "${LOCALES[@]}"; do
    echo ""
    echo "=========================================="
    echo "Translating locale: $LOCALE"
    echo "=========================================="
    
    python3 scripts/bulk-translate-tud-file.py "$LOCALE" || {
        echo "❌ Failed to translate $LOCALE"
        exit 1
    }
    
    # Compile messages
    echo "Compiling messages for $LOCALE..."
    node scripts/compile-messages.mjs || echo "⚠️ Compilation warning"
    
    # Check progress
    DONE=$(python3 -c "
import json
from pathlib import Path

en_dir = Path('src/messages/en')
locale_dir = Path('src/messages/$LOCALE')
total = 0
translated = 0

for en_file in en_dir.rglob('*.json'):
    rel_path = en_file.relative_to(en_dir)
    locale_file = locale_dir / rel_path
    
    with open(en_file) as f:
        en_data = json.load(f)
    
    if locale_file.exists():
        with open(locale_file) as f:
            locale_data = json.load(f)
        if en_data != locale_data:
            translated += 1
        total += 1

print(f'{translated}/{total}')
" 2>/dev/null || echo "0/0")
    
    echo "✅ $LOCALE: $DONE files translated"
done

echo ""
echo "=========================================="
echo "ALL TRANSLATIONS COMPLETE!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. node scripts/compile-messages.mjs"
echo "  2. npm run dev"
echo "  3. Test all locales in the UI"
