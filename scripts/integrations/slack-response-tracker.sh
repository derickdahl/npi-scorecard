#!/bin/bash
# Executive OS - Slack Response Tracker
# Monitors Slack messages and marks them as done when replied to

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATE_FILE="$SCRIPT_DIR/.slack_response_state.json"

# Source the main tracking script
source "$(dirname "$SCRIPT_DIR")/message-tracking.sh"

# Initialize state file if not exists
if [ ! -f "$STATE_FILE" ]; then
    echo '{"last_check":"0","processed_message_ts":[]}' > "$STATE_FILE"
fi

# Check if Slack token is available
SLACK_TOKEN=""
if [ -f ~/.clawdbot/credentials/slack-token ]; then
    SLACK_TOKEN=$(cat ~/.clawdbot/credentials/slack-token)
fi

if [ -z "$SLACK_TOKEN" ]; then
    log "⚠️ Slack token not found, skipping Slack response tracking"
    exit 0
fi

log "Checking for Slack responses..."

# Get user ID for Derick
USER_INFO=$(curl -s -H "Authorization: Bearer $SLACK_TOKEN" \
    "https://slack.com/api/auth.test")

USER_ID=$(echo "$USER_INFO" | jq -r '.user_id')

if [ "$USER_ID" = "null" ] || [ "$USER_ID" = "" ]; then
    log "❌ Could not get Slack user ID"
    exit 1
fi

# Get last check timestamp
LAST_CHECK=$(jq -r '.last_check' "$STATE_FILE")
CURRENT_TIME=$(date +%s)

# Get DMs and mentions since last check
# First, get list of channels/DMs
CONVERSATIONS=$(curl -s -H "Authorization: Bearer $SLACK_TOKEN" \
    "https://slack.com/api/conversations.list?types=public_channel,private_channel,mpim,im&limit=200")

echo "$CONVERSATIONS" | jq -r '.channels[] | @base64' | while read -r channel_b64; do
    channel=$(echo "$channel_b64" | base64 -d)
    
    channel_id=$(echo "$channel" | jq -r '.id')
    channel_name=$(echo "$channel" | jq -r '.name // ""')
    is_im=$(echo "$channel" | jq -r '.is_im')
    
    # Get recent messages in this channel/DM
    MESSAGES=$(curl -s -H "Authorization: Bearer $SLACK_TOKEN" \
        "https://slack.com/api/conversations.history?channel=$channel_id&oldest=$LAST_CHECK&limit=100")
    
    echo "$MESSAGES" | jq -r '.messages[]? | @base64' | while read -r msg_b64; do
        message=$(echo "$msg_b64" | base64 -d)
        
        msg_ts=$(echo "$message" | jq -r '.ts')
        msg_user=$(echo "$message" | jq -r '.user // ""')
        msg_text=$(echo "$message" | jq -r '.text // ""')
        msg_thread_ts=$(echo "$message" | jq -r '.thread_ts // ""')
        
        # Skip our own messages
        if [ "$msg_user" = "$USER_ID" ]; then
            continue
        fi
        
        # Skip if already processed
        if jq -e ".processed_message_ts | index(\"$msg_ts\")" "$STATE_FILE" > /dev/null 2>&1; then
            continue
        fi
        
        # Check if this requires our attention (DM or mention)
        requires_attention=false
        channel_type="slack"
        
        if [ "$is_im" = "true" ]; then
            requires_attention=true
        elif echo "$msg_text" | grep -q "<@$USER_ID>"; then
            requires_attention=true
        fi
        
        if [ "$requires_attention" = "true" ]; then
            # Check if we've responded
            has_response=false
            
            if [ "$msg_thread_ts" != "" ]; then
                # Check thread replies
                THREAD_REPLIES=$(curl -s -H "Authorization: Bearer $SLACK_TOKEN" \
                    "https://slack.com/api/conversations.replies?channel=$channel_id&ts=$msg_thread_ts")
                
                # Check if any replies are from us
                our_reply=$(echo "$THREAD_REPLIES" | jq -r ".messages[]? | select(.user == \"$USER_ID\") | select(.ts > \"$msg_ts\") | .ts" | head -1)
                if [ "$our_reply" != "" ] && [ "$our_reply" != "null" ]; then
                    has_response=true
                fi
            else
                # Check subsequent messages in channel
                RECENT_MESSAGES=$(curl -s -H "Authorization: Bearer $SLACK_TOKEN" \
                    "https://slack.com/api/conversations.history?channel=$channel_id&oldest=$msg_ts&limit=20")
                
                # Check if any are from us
                our_reply=$(echo "$RECENT_MESSAGES" | jq -r ".messages[]? | select(.user == \"$USER_ID\") | select(.ts > \"$msg_ts\") | .ts" | head -1)
                if [ "$our_reply" != "" ] && [ "$our_reply" != "null" ]; then
                    has_response=true
                fi
            fi
            
            if [ "$has_response" = "true" ]; then
                # Get user info for sender
                USER_INFO=$(curl -s -H "Authorization: Bearer $SLACK_TOKEN" \
                    "https://slack.com/api/users.info?user=$msg_user")
                
                sender_name=$(echo "$USER_INFO" | jq -r '.user.real_name // .user.name')
                
                # Convert Slack timestamp to ISO format
                msg_time=$(echo "$msg_ts" | cut -d. -f1)
                received_at=$(date -r "$msg_time" -u '+%Y-%m-%dT%H:%M:%SZ')
                
                # Create message ID
                external_id="slack_${channel_id}_${msg_ts}"
                
                # Extract preview
                preview=$(echo "$msg_text" | head -c 100)
                
                log "Found Slack response:"
                log "  Channel: #$channel_name"
                log "  From: $sender_name"
                log "  Message: $preview"
                
                # Mark as done
                mark_message_done "$external_id" "$channel_type" "$sender_name" "$preview" "$received_at" "slack_reply"
            fi
        fi
        
        # Mark as processed
        jq ".processed_message_ts += [\"$msg_ts\"]" "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
    done
done

# Update last check time
jq ".last_check = \"$CURRENT_TIME\"" "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"

log "Slack response tracking complete."