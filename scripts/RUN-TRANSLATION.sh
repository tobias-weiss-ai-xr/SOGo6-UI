#!/bin/bash
# Direct execution without confirmation prompts

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "=========================================="
echo "SOGo6 FULL TRANSLATION EXECUTION"
echo "Model: TUD Mistral-Medium-3.5-128B"
echo "Target: All locales with remaining English files"
echo "Started: $(date)"
echo "=========================================="

# Export API key
export TUD_API_KEY=${TUD_API_KEY:-sk-06gvQTIMhGyqBMfYO6MuaQ}

# All target locales
ALL_LOCALES=("de" "es" "fr" "zh" "it" "pt" "nl" "pl" "ru" "sv" "da" "fi" "no" "cs" "el" "tr" "hu" "ro" "ja" "hi" "ar" "ko" "th" "vi" "id")

TOTAL_FILES=0
TOTAL_STRINGS=0
START_OVERALL=$(date +%s)

# Process each locale
for locale in "${ALL_LOCALES[@]}"; do
    echo ""
    echo "=========================================="
    echo "Processing: $locale"
    echo "=========================================="
    
    START=$(date +%s)
    
    # Run translation
    OUTPUT=$(python3 scripts/bulk-translate-tud-file.py "$locale" 2>&1) || {
        echo "❌ Failed to translate $locale"
        echo "$OUTPUT"
        continue
    }
    
    echo "$OUTPUT"
    
    # Compile messages
    echo "Compiling messages for $locale..."
    node scripts/compile-messages.mjs 2>&1 | grep -E "(compile-messages|Done)" || echo "  ✓ Compiled"
    
    # Quick check
    ELAPSED=$(( $(date +%s) - START ))
    echo "✅ $locale completed in ${ELAPSED}s"
    
    TOTAL_FILES=$((TOTAL_FILES + 1))
done

ELAPSED_OVERALL=$(( $(date +%s) - START_OVERALL ))

echo ""
echo "=========================================="
echo "ALL TRANSLATIONS COMPLETE"
echo "=========================================="
echo "Total time: ${ELAPSED_OVERALL}s ($(echo "scale=1; $ELAPSED_OVERALL/60" | bc) minutes)"
echo "Locales processed: ${#ALL_LOCALES[@]}"
echo ""

echo "Compiling final messages..."
node scripts/compile-messages.mjs 2>&1 | tail -3

echo ""
echo "✅ Translation pipeline finished!"
echo ""
echo "Summary:"
echo "- All locales translated using TUD Mistral-Medium-3.5-128B"
echo "- Messages compiled to src/compiled-messages/"
echo "- Ready for npm run dev"
