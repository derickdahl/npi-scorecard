#!/bin/bash
# L3 Executive OS - Auto Acknowledge
# Sends acknowledgment email

set -e

TOKEN=$(~/.clawdbot/scripts/msgraph.sh token)

# Arguments
TO_EMAIL="$1"
TO_NAME="$2"
ORIGINAL_SUBJECT="$3"
MESSAGE_ID="$4"
RESPONSE_DAYS="${5:-2}"  # Default 2 business days

# Calculate response date (skip weekends)
if [ "$(date +%u)" -ge 4 ]; then
    # Thursday or later, add extra days for weekend
    RESPONSE_DATE=$(date -v+$((RESPONSE_DAYS + 2))d "+%A, %B %d")
else
    RESPONSE_DATE=$(date -v+${RESPONSE_DAYS}d "+%A, %B %d")
fi

# Determine if internal or external
if echo "$TO_EMAIL" | grep -qiE "(sonance|iport|danainnovations|jamesloudspeaker)\.com$"; then
    IS_INTERNAL=true
else
    IS_INTERNAL=false
fi

# Generate response based on internal/external
if [ "$IS_INTERNAL" = true ]; then
    SUBJECT="Re: $ORIGINAL_SUBJECT"
    BODY="Hi ${TO_NAME%%\ *},

Got it! I'll follow up by $RESPONSE_DATE.

If you need something sooner, just let me know and I'll prioritize.

Thanks,
Derick

---
[Auto-acknowledged by Elle]"
else
    SUBJECT="Re: $ORIGINAL_SUBJECT"
    BODY="Hi ${TO_NAME%%\ *},

Thank you for reaching out! I've received your message and will respond by $RESPONSE_DATE.

If this is time-sensitive, please reply with \"URGENT\" in the subject line and I'll prioritize accordingly.

Best regards,
Derick Dahl
Head of Technology & Innovation
Sonance

---
[Auto-acknowledged by Elle]"
fi

# Create the email JSON
EMAIL_JSON=$(cat <<EOF
{
    "message": {
        "subject": "$SUBJECT",
        "body": {
            "contentType": "Text",
            "content": $(echo "$BODY" | jq -Rs .)
        },
        "toRecipients": [
            {
                "emailAddress": {
                    "address": "$TO_EMAIL",
                    "name": "$TO_NAME"
                }
            }
        ]
    },
    "saveToSentItems": "true"
}
EOF
)

echo "Sending acknowledgment to: $TO_NAME <$TO_EMAIL>"
echo "Response promised by: $RESPONSE_DATE"

# Send the email
RESPONSE=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "$EMAIL_JSON" \
    "https://graph.microsoft.com/v1.0/me/sendMail")

if [ -z "$RESPONSE" ]; then
    echo "✓ Acknowledgment sent successfully"
else
    echo "Response: $RESPONSE"
fi
