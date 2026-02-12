#!/bin/bash
# Executive OS - Teams Response Tracker
# Monitors Teams messages and marks them as done when replied to

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATE_FILE="$SCRIPT_DIR/.teams_response_state.json"

# Source the main tracking script
source "$(dirname "$SCRIPT_DIR")/message-tracking.sh"

# Initialize state file if not exists
if [ ! -f "$STATE_FILE" ]; then
    echo '{"last_check":"2026-01-01T00:00:00Z","processed_message_ids":[]}' > "$STATE_FILE"
fi

# Get access token
TOKEN=$(~/.clawdbot/scripts/msgraph.sh token)

log "Checking for Teams responses..."

# Get recent chat messages where we've been active
# Note: This requires Microsoft Graph permissions for Teams (Chat.Read, Chat.ReadWrite)

# Get all chats
CHATS=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "https://graph.microsoft.com/v1.0/me/chats?\$top=50")

echo "$CHATS" | jq -r '.value[] | @base64' | while read -r chat_b64; do
    chat=$(echo "$chat_b64" | base64 -d)
    
    chat_id=$(echo "$chat" | jq -r '.id')
    chat_type=$(echo "$chat" | jq -r '.chatType')
    
    # Get recent messages in this chat
    MESSAGES=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "https://graph.microsoft.com/v1.0/me/chats/$chat_id/messages?\$top=20&\$orderby=createdDateTime%20desc")
    
    # Look for messages where we responded
    echo "$MESSAGES" | jq -r '.value[] | @base64' | while read -r msg_b64; do
        message=$(echo "$msg_b64" | base64 -d)
        
        msg_id=$(echo "$message" | jq -r '.id')
        from_user=$(echo "$message" | jq -r '.from.user.displayName // "Unknown"')
        from_email=$(echo "$message" | jq -r '.from.user.userPrincipalName // ""')
        body=$(echo "$message" | jq -r '.body.content // ""')
        created_time=$(echo "$message" | jq -r '.createdDateTime')
        message_type=$(echo "$message" | jq -r '.messageType // "message"')
        
        # Skip system messages and our own messages
        if [ "$message_type" != "message" ] || echo "$from_email" | grep -qiE "derickd?@sonance\.com|derick"; then
            continue
        fi
        
        # Skip if already processed
        if jq -e ".processed_message_ids | index(\"$msg_id\")" "$STATE_FILE" > /dev/null 2>&1; then
            continue
        fi
        
        # Check if this message mentions us or is a DM
        is_mention=false
        is_dm=false
        
        if [ "$chat_type" = "oneOnOne" ]; then
            is_dm=true
        elif echo "$body" | grep -qi "@derick\|@derickd"; then
            is_mention=true
        fi
        
        if [ "$is_mention" = true ] || [ "$is_dm" = true ]; then
            # Check if we've responded to this message by looking at subsequent messages
            RECENT_MESSAGES=$(curl -s -H "Authorization: Bearer $TOKEN" \
                "https://graph.microsoft.com/v1.0/me/chats/$chat_id/messages?\$filter=createdDateTime%20gt%20$created_time&\$top=10")
            
            # Check if any of the recent messages are from us
            has_response=$(echo "$RECENT_MESSAGES" | jq -r '.value[] | select(.from.user.userPrincipalName | test("derickd?@sonance\\.com"; "i")) | .id' | head -1)
            
            if [ "$has_response" != "" ] && [ "$has_response" != "null" ]; then
                # We responded to this message
                channel="teams_dm"
                if [ "$is_mention" = true ]; then
                    channel="teams_mention"
                fi
                
                # Extract preview from body (remove HTML tags)
                preview=$(echo "$body" | sed 's/<[^>]*>//g' | head -c 100)
                
                log "Found Teams response:"
                log "  Message ID: $msg_id"
                log "  From: $from_user"
                log "  Type: $channel"
                log "  Preview: $preview"
                
                # Mark the message as done
                mark_message_done "$msg_id" "$channel" "$from_user" "$preview" "$created_time" "teams_reply"
            fi
        fi
        
        # Mark as processed
        jq ".processed_message_ids += [\"$msg_id\"]" "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
    done
done

# Update last check time
jq ".last_check = \"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\"" "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"

log "Teams response tracking complete."