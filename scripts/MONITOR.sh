#!/bin/bash
# Monitor all running translation processes

echo "=========================================="
echo "TRANSLATION MONITOR"
echo "$(date)"
echo "=========================================="
echo

# Active translation logs
LOGS=("da-translation" "no-translation" "pl-translation" "sv-translation" "ja-translation" "id-translation" "ru-translation" "fi-translation" "cs-translation" "el-translation" "tr-translation" "hu-translation" "ro-translation" "hi-translation" "ar-translation" "ko-translation" "th-translation" "vi-translation" "zh-translation" "de-translation" "es-translation" "fr-translation" "pt-translation" "nl-translation")

for log in "${LOGS[@]}"; do
    if [ -f "/tmp/${log}.log" ]; then
        locale=$(echo "$log" | sed 's/-translation//')
        status=$(tail -1 "/tmp/${log}.log" | head -1)
        
        # Count batches and files
        batches=$(grep -c "Batch" "/tmp/${log}.log" 2>/dev/null || echo 0)
        files=$(grep -c "Saved:" "/tmp/${log}.log" 2>/dev/null || echo 0)
        
        echo "$locale:"
        echo "  Status: $status"
        echo "  Files saved: $files"
        echo "  Batches completed: $batches"
        echo "  Last activity: $(stat -c %y /tmp/${log}.log 2>/dev/null | cut -d' ' -f2 | cut -d'.' -f1)"
        echo
    fi
done

echo "=========================================="
echo "Running processes:"
ps aux | grep "bulk-translate-tud-file.py" | grep -v grep | grep -v "grep bulk" | grep -v MONITOR

echo "=========================================="
