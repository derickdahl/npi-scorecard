#!/bin/bash
# Executive OS - Message Tracking Integration
# Universal script to mark messages as done across all platforms

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$SCRIPT_DIR/message-tracking.log"
EXECUTIVE_OS_URL="${EXECUTIVE_OS_URL:-https://executive-os-eight.vercel.app}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "$1"
}

# Function to mark a message as done
mark_message_done() {
    local external_id="$1"
    local channel="$2" 
    local sender="$3"
    local subject="$4"
    local received_at="$5"
    local response_method="${6:-manual}"
    
    log "Marking message as done: $external_id ($channel)"
    
    # Call Executive OS API
    response=$(curl -s -X POST "$EXECUTIVE_OS_URL/api/messages/mark-done" \
        -H "Content-Type: application/json" \
        -d "{
            \"externalId\": \"$external_id\",
            \"channel\": \"$channel\",
            \"sender\": \"$sender\",
            \"subject\": \"$subject\",
            \"receivedAt\": \"$received_at\",
            \"responseMethod\": \"$response_method\"
        }")
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        response_time=$(echo "$response" | jq -r '.responseTimeMinutes // "unknown"')
        log "✅ Message $external_id marked as done (${response_time}min)"
        return 0
    else
        error=$(echo "$response" | jq -r '.error // "Unknown error"')
        log "❌ Failed to mark message $external_id as done: $error"
        return 1
    fi
}

# Export function for use in other scripts
export -f mark_message_done
export -f log
export EXECUTIVE_OS_URL
export LOG_FILE

# If called with arguments, mark that specific message as done
if [ $# -ge 2 ]; then
    mark_message_done "$@"
fi