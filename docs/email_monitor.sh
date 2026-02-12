#!/bin/bash
# L3 Executive OS - Email Monitor
# Checks for new emails and auto-acknowledges

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATE_FILE="$SCRIPT_DIR/.email_state.json"
LOG_FILE="$SCRIPT_DIR/email_monitor.log"

# Initialize state file if not exists
if [ ! -f "$STATE_FILE" ]; then
    echo '{"last_check":"2026-01-28T00:00:00Z","processed_ids":[]}' > "$STATE_FILE"
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "$1"
}

# Get access token
TOKEN=$(~/.clawdbot/scripts/msgraph.sh token)

# Get unread emails from the last 24 hours
log "Checking for new emails..."

EMAILS=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "https://graph.microsoft.com/v1.0/me/messages?\$filter=isRead%20eq%20false&\$select=id,subject,from,receivedDateTime,bodyPreview,importance&\$top=20&\$orderby=receivedDateTime%20desc")

# Parse and process
echo "$EMAILS" | jq -r '.value[] | @base64' | while read -r email_b64; do
    email=$(echo "$email_b64" | base64 -d)
    
    id=$(echo "$email" | jq -r '.id')
    subject=$(echo "$email" | jq -r '.subject')
    from_email=$(echo "$email" | jq -r '.from.emailAddress.address')
    from_name=$(echo "$email" | jq -r '.from.emailAddress.name')
    importance=$(echo "$email" | jq -r '.importance')
    preview=$(echo "$email" | jq -r '.bodyPreview' | head -c 200)
    
    # Skip if already processed
    if jq -e ".processed_ids | index(\"$id\")" "$STATE_FILE" > /dev/null 2>&1; then
        continue
    fi
    
    # Skip certain senders (no-reply, automated, etc.)
    if echo "$from_email" | grep -qiE "(no-?reply|noreply|automated|notification|alert|mailer-daemon)"; then
        log "Skipping automated email from: $from_email"
        # Mark as processed
        jq ".processed_ids += [\"$id\"]" "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
        continue
    fi
    
    # Skip if from Microsoft/Teams notifications
    if echo "$from_email" | grep -qiE "(microsoft|teams\.mail\.microsoft)"; then
        log "Skipping Microsoft notification from: $from_email"
        jq ".processed_ids += [\"$id\"]" "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
        continue
    fi
    
    log "New email requiring acknowledgment:"
    log "  From: $from_name <$from_email>"
    log "  Subject: $subject"
    log "  Importance: $importance"
    
    # Output for L3 to process
    echo "---NEW_EMAIL---"
    echo "ID: $id"
    echo "FROM: $from_name <$from_email>"
    echo "SUBJECT: $subject"
    echo "IMPORTANCE: $importance"
    echo "PREVIEW: $preview"
    echo "---END_EMAIL---"
    
    # Mark as seen (not processed until acknowledged)
    jq ".processed_ids += [\"$id\"]" "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
done

log "Email check complete."
