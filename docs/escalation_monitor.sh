#!/bin/bash
# Elle Executive OS - Escalation Monitor
# Detects URGENT emails and escalates immediately

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATE_FILE="$SCRIPT_DIR/.escalation_state.json"
LOG_FILE="$SCRIPT_DIR/escalation_monitor.log"
DERICK_PHONE="+19493749550"

# Initialize state file if not exists
if [ ! -f "$STATE_FILE" ]; then
    echo '{"processed_ids":[],"escalated_ids":[]}' > "$STATE_FILE"
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "$1"
}

# Get access token
TOKEN=$(~/.clawdbot/scripts/msgraph.sh token 2>/dev/null)

log "=== Checking for URGENT emails ==="

# Get recent emails (last few hours)
EMAILS=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "https://graph.microsoft.com/v1.0/me/messages?\$top=20&\$orderby=receivedDateTime%20desc&\$select=id,subject,from,receivedDateTime,bodyPreview,importance,isRead")

# Process each email looking for urgency signals
echo "$EMAILS" | jq -c '.value[]' | while read -r email; do
    id=$(echo "$email" | jq -r '.id')
    subject=$(echo "$email" | jq -r '.subject')
    from_email=$(echo "$email" | jq -r '.from.emailAddress.address')
    from_name=$(echo "$email" | jq -r '.from.emailAddress.name')
    importance=$(echo "$email" | jq -r '.importance')
    preview=$(echo "$email" | jq -r '.bodyPreview')
    is_read=$(echo "$email" | jq -r '.isRead')
    
    # Skip if already escalated
    if jq -e ".escalated_ids | index(\"$id\")" "$STATE_FILE" > /dev/null 2>&1; then
        continue
    fi
    
    # Skip automated senders
    if echo "$from_email" | grep -qiE "(no-?reply|noreply|automated|notification|microsoft|teams\.mail)"; then
        continue
    fi
    
    # Check for urgency signals
    IS_URGENT=false
    URGENCY_REASON=""
    
    # Check subject for URGENT
    if echo "$subject" | grep -qiE "(urgent|asap|emergency|critical|time.?sensitive|immediately)"; then
        IS_URGENT=true
        URGENCY_REASON="Subject contains urgency keyword"
    fi
    
    # Check body for URGENT
    if echo "$preview" | grep -qiE "^URGENT|urgent.*please|need.*immediately|asap|critical|emergency"; then
        IS_URGENT=true
        URGENCY_REASON="Body contains urgency keyword"
    fi
    
    # Check if marked high importance
    if [ "$importance" = "high" ]; then
        IS_URGENT=true
        URGENCY_REASON="Marked high importance"
    fi
    
    if [ "$IS_URGENT" = true ]; then
        log "🚨 URGENT EMAIL DETECTED!"
        log "  From: $from_name <$from_email>"
        log "  Subject: $subject"
        log "  Reason: $URGENCY_REASON"
        
        # Mark as escalated
        jq ".escalated_ids += [\"$id\"]" "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
        
        # Output for processing
        echo "---URGENT_EMAIL---"
        echo "ID: $id"
        echo "FROM_NAME: $from_name"
        echo "FROM_EMAIL: $from_email"
        echo "SUBJECT: $subject"
        echo "REASON: $URGENCY_REASON"
        echo "PREVIEW: ${preview:0:200}"
        echo "---END_URGENT---"
    fi
done

log "Escalation check complete."
