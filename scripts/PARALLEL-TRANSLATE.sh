#!/bin/bash
# Parallel translation script - runs 4 locales concurrently

set -e

cd "$(dirname "$0")/.."

echo "=========================================="
echo "PARALLEL TRANSLATION"
echo "Running 4 locales at once"
echo "Started: $(date)"
echo "=========================================="

# Export API key
export TUD_API_KEY=${TUD_API_KEY:-sk-06gvQTIMhGyqBMfYO6MuaQ}

# Group locales into batches of 4
BATCHES=(
    "da no sv pl"    # Batch 1: Scandinavian + Polish
    "ru fi cs el"    # Batch 2: Eastern European
    "tr hu ro ja"    # Batch 3: Mixed
    "hi ar ko th"    # Batch 4: Asian
    "vi zh de es"    # Batch 5: Remaining
    "fr it pt nl"    # Batch 6: Romance + Dutch
)

# Function to translate one locale
translate_locale() {
    local locale=$1
    local logfile="/tmp/translation-${locale}.log"
    
    echo "Starting translation for $locale..."
    echo "  Log: $logfile"
    
    python3 -u scripts/bulk-translate-tud-file.py "$locale" > "$logfile" 2>&1
    
    # Compile messages
    node scripts/compile-messages.mjs > /dev/null 2>&1
    
    echo "✅ $locale completed"
    
    # Show summary
    tail -5 "$logfile" | grep -E "(Summary|files processed|strings translated)" || true
}

# Run batches sequentially (4 at a time)
for batch in "${BATCHES[@]}"; do
    echo ""
    echo "=========================================="
    echo "Batch: $batch"
    echo "=========================================="
    
    locales=($batch)
    pids=()
    
    for locale in "${locales[@]}"; do
        translate_locale "$locale" &
        pids+=($!)
    done
    
    # Wait for all in this batch to finish
    for pid in "${pids[@]}"; do
        wait "$pid"
    done
    
    echo "✅ Batch complete"
done

echo ""
echo "=========================================="
echo "ALL PARALLEL TRANSLATIONS COMPLETE"
echo "=========================================="
echo "Finished: $(date)"
