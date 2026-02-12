#!/bin/bash
# Executive OS - Email Response Tracker
# Monitors sent emails and marks corresponding messages as done

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATE_FILE="$SCRIPT_DIR/.email_response_state.json"

# Source the main tracking script
source "$(dirname "$SCRIPT_DIR")/message-tracking.sh"

# Initialize state file if not exists
if [ ! -f "$STATE_FILE" ]; then
    echo '{"last_check":"2026-01-01T00:00:00Z","processed_sent_ids":[]}' > "$STATE_FILE"
fi

# Get access token
TOKEN=$(~/.clawdbot/scripts/msgraph.sh token)

log "Checking for newly sent emails..."

# Get sent emails from the last 24 hours
SENT_EMAILS=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "https://graph.microsoft.com/v1.0/me/mailFolders/SentItems/messages?\$filter=sentDateTime%20gt%20$(date -u -v-1d '+%Y-%m-%dT%H:%M:%SZ')&\$select=id,subject,toRecipients,sentDateTime,conversationId&\$top=50")

# Process sent emails to find responses
echo "$SENT_EMAILS" | jq -r '.value[] | @base64' | while read -r email_b64; do
    email=$(echo "$email_b64" | base64 -d)
    
    sent_id=$(echo "$email" | jq -r '.id')
    subject=$(echo "$email" | jq -r '.subject')
    sent_time=$(echo "$email" | jq -r '.sentDateTime')
    conversation_id=$(echo "$email" | jq -r '.conversationId')
    
    # Skip if already processed
    if jq -e ".processed_sent_ids | index(\"$sent_id\")" "$STATE_FILE" > /dev/null 2>&1; then
        continue
    fi
    
    # Skip auto-acknowledgments (they contain the signature)
    if echo "$subject" | grep -q "Re:" && ! echo "$subject" | grep -q "Auto-acknowledged"; then
        # This is likely a response to an incoming email
        # Get the original email in this conversation
        CONVERSATION_EMAILS=$(curl -s -H "Authorization: Bearer $TOKEN" \
            "https://graph.microsoft.com/v1.0/me/messages?\$filter=conversationId%20eq%20'$conversation_id'&\$select=id,subject,from,receivedDateTime,isRead&\$orderby=receivedDateTime")
        
        # Find the original email (oldest in conversation that's not from us)
        original_email=$(echo "$CONVERSATION_EMAILS" | jq -r '.value[] | select(.from.emailAddress.address != null) | select(.from.emailAddress.address | test("@sonance\\.com"; "i") | not) | .[0]')
        
        if [ "$original_email" != "null" ] && [ "$original_email" != "" ]; then
            original_id=$(echo "$original_email" | jq -r '.id')
            from_email=$(echo "$original_email" | jq -r '.from.emailAddress.address')
            from_name=$(echo "$original_email" | jq -r '.from.emailAddress.name')
            received_time=$(echo "$original_email" | jq -r '.receivedDateTime')
            
            # Determine if internal or external email
            if echo "$from_email" | grep -qiE "(sonance|iport|danainnovations|jamesloudspeaker)\.com$"; then
                channel="email_work"
            else
                channel="email_personal"
            fi
            
            log "Found response to email:"
            log "  Original ID: $original_id"
            log "  From: $from_name <$from_email>"
            log "  Subject: $subject"
            log "  Response sent: $sent_time"
            
            # Mark the original message as done
            mark_message_done "$original_id" "$channel" "$from_name <$from_email>" "$subject" "$received_time" "email_reply"
        fi
    fi
    
    # Mark this sent email as processed
    jq ".processed_sent_ids += [\"$sent_id\"] | .last_check = \"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\"" "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
done

log "Email response tracking complete."