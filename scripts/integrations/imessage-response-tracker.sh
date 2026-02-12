#!/bin/bash
# Executive OS - iMessage Response Tracker
# Monitors iMessage conversations and marks them as done when replied to

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATE_FILE="$SCRIPT_DIR/.imessage_response_state.json"

# Source the main tracking script
source "$(dirname "$SCRIPT_DIR")/message-tracking.sh"

# Initialize state file if not exists
if [ ! -f "$STATE_FILE" ]; then
    echo '{"last_check":"0","processed_message_ids":[]}' > "$STATE_FILE"
fi

log "Checking for iMessage responses..."

# Check if imsg CLI is available
if ! command -v imsg >/dev/null 2>&1; then
    log "⚠️ imsg CLI not found, skipping iMessage response tracking"
    exit 0
fi

# Get last check timestamp
LAST_CHECK=$(jq -r '.last_check' "$STATE_FILE")
CURRENT_TIME=$(date +%s)

# Get recent conversations
RECENT_CHATS=$(imsg -j -c list | jq -r '.[] | select(.last_message_timestamp > '$LAST_CHECK') | .chat_identifier')

echo "$RECENT_CHATS" | while read -r chat_id; do
    if [ -z "$chat_id" ] || [ "$chat_id" = "null" ]; then
        continue
    fi
    
    # Get recent messages in this chat
    MESSAGES=$(imsg -j -c history -t "$chat_id" --limit 50)
    
    echo "$MESSAGES" | jq -r '.[] | @base64' | while read -r msg_b64; do
        message=$(echo "$msg_b64" | base64 -d)
        
        msg_id=$(echo "$message" | jq -r '.message_id')
        is_from_me=$(echo "$message" | jq -r '.is_from_me')
        sender=$(echo "$message" | jq -r '.sender // "Unknown"')
        text=$(echo "$message" | jq -r '.text // ""')
        timestamp=$(echo "$message" | jq -r '.timestamp')
        
        # Skip if already processed
        if jq -e ".processed_message_ids | index(\"$msg_id\")" "$STATE_FILE" > /dev/null 2>&1; then
            continue
        fi
        
        # Skip our own messages initially
        if [ "$is_from_me" = "true" ]; then
            jq ".processed_message_ids += [\"$msg_id\"]" "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
            continue
        fi
        
        # Skip if older than our last check
        if [ "$timestamp" -lt "$LAST_CHECK" ]; then
            continue
        fi
        
        # This is an incoming message - check if we responded
        # Look for messages from us after this timestamp
        OUR_RESPONSES=$(echo "$MESSAGES" | jq -r ".[] | select(.is_from_me == true) | select(.timestamp > $timestamp) | .timestamp" | head -1)
        
        if [ "$OUR_RESPONSES" != "" ] && [ "$OUR_RESPONSES" != "null" ]; then
            # We responded to this message
            
            # Convert timestamp to ISO format
            received_at=$(date -r "$timestamp" -u '+%Y-%m-%dT%H:%M:%SZ')
            
            # Create external ID
            external_id="imessage_${chat_id}_${msg_id}"
            
            # Extract preview
            preview=$(echo "$text" | head -c 100)
            
            log "Found iMessage response:"
            log "  Chat: $chat_id"
            log "  From: $sender"
            log "  Message: $preview"
            
            # Mark as done
            mark_message_done "$external_id" "imessage" "$sender" "$preview" "$received_at" "imessage_reply"
        fi
        
        # Mark as processed
        jq ".processed_message_ids += [\"$msg_id\"]" "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
    done
done

# Update last check time
jq ".last_check = \"$CURRENT_TIME\"" "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"

log "iMessage response tracking complete."