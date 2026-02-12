#!/bin/bash
# Elle Executive OS - Urgent Escalation Handler
# Notifies Derick and sends fast-track acknowledgment

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Arguments
FROM_EMAIL="$1"
FROM_NAME="$2"
SUBJECT="$3"
PREVIEW="$4"

TOKEN=$(~/.clawdbot/scripts/msgraph.sh token 2>/dev/null)

echo "🚨 Processing URGENT escalation..."

# 1. Send urgent acknowledgment to the sender (4-hour SLA)
URGENT_RESPONSE="Hi ${FROM_NAME%%\ *},

I've flagged your message as urgent and Derick has been notified immediately.

You can expect a response within the next 4 hours. If you need to reach him sooner, you can also try Teams.

Thanks for your patience,
Elle
(Derick's AI Assistant)

---
[Escalated by Elle - Urgent Priority]"

EMAIL_JSON=$(cat <<EOF
{
    "message": {
        "subject": "Re: $SUBJECT [URGENT - Received]",
        "body": {
            "contentType": "Text",
            "content": $(echo "$URGENT_RESPONSE" | jq -Rs .)
        },
        "toRecipients": [
            {
                "emailAddress": {
                    "address": "$FROM_EMAIL",
                    "name": "$FROM_NAME"
                }
            }
        ]
    },
    "saveToSentItems": "true"
}
EOF
)

echo "Sending urgent acknowledgment to: $FROM_NAME"
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "$EMAIL_JSON" \
    "https://graph.microsoft.com/v1.0/me/sendMail"

echo "✓ Urgent acknowledgment sent"

# 2. Output notification for iMessage (to be handled by calling script)
echo ""
echo "---NOTIFY_DERICK---"
echo "🚨 URGENT EMAIL"
echo ""
echo "From: $FROM_NAME"
echo "Subject: $SUBJECT"
echo ""
echo "Preview: ${PREVIEW:0:150}..."
echo ""
echo "⏰ 4-hour SLA promised"
echo "---END_NOTIFY---"
