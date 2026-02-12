#!/bin/bash
# Executive OS - Clawdbot Integration
# Automatically marks messages as done when L3 responds via Clawdbot

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Source the main tracking script
source "$SCRIPT_DIR/message-tracking.sh"

# This script can be called by Clawdbot hooks or via webhook
# Usage: ./clawdbot-integration.sh <message_id> <channel> <sender> <subject> [received_at]

if [ $# -lt 4 ]; then
    echo "Usage: $0 <message_id> <channel> <sender> <subject> [received_at]"
    echo ""
    echo "Channels: email_work, email_personal, slack, teams_mention, teams_dm, imessage"
    echo "Example: $0 'msg123' 'email_work' 'John Doe <john@example.com>' 'Meeting Request'"
    exit 1
fi

MESSAGE_ID="$1"
CHANNEL="$2"
SENDER="$3"
SUBJECT="$4"
RECEIVED_AT="${5:-$(date -u -v-1h '+%Y-%m-%dT%H:%M:%SZ')}" # Default to 1 hour ago if not provided

log "🤖 L3 responded via Clawdbot:"
log "  Message ID: $MESSAGE_ID"
log "  Channel: $CHANNEL"
log "  Sender: $SENDER"
log "  Subject: $SUBJECT"

# Mark the message as done
if mark_message_done "$MESSAGE_ID" "$CHANNEL" "$SENDER" "$SUBJECT" "$RECEIVED_AT" "ai_response"; then
    echo "✅ Message marked as done in Executive OS"
else
    echo "❌ Failed to mark message as done"
    exit 1
fi