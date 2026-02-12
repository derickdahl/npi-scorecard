#!/bin/bash
# Executive OS - Response Tracking Setup Script
# Sets up cron jobs and necessary permissions

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Setting up Executive OS Response Tracking..."

# Make all scripts executable
chmod +x "$SCRIPT_DIR/message-tracking.sh"
chmod +x "$SCRIPT_DIR/run-response-tracking.sh"
chmod +x "$SCRIPT_DIR"/integrations/*.sh

# Create integrations directory if it doesn't exist
mkdir -p "$SCRIPT_DIR/integrations"

# Create logs directory
mkdir -p "$SCRIPT_DIR/logs"

echo "✅ Scripts made executable"

# Check if Executive OS is running (development mode)
EXECUTIVE_OS_URL="${EXECUTIVE_OS_URL:-http://localhost:3000}"

if curl -s "$EXECUTIVE_OS_URL/api/health" > /dev/null 2>&1; then
    echo "✅ Executive OS is running at $EXECUTIVE_OS_URL"
else
    echo "⚠️  Executive OS not detected at $EXECUTIVE_OS_URL"
    echo "   Make sure Executive OS is running before testing"
fi

# Check required credentials
echo ""
echo "🔑 Checking credentials..."

if [ -f ~/.clawdbot/credentials/microsoft-graph.json ]; then
    echo "✅ Microsoft Graph credentials found"
else
    echo "❌ Microsoft Graph credentials missing"
    echo "   Run: ~/.clawdbot/scripts/msgraph.sh setup"
fi

if [ -f ~/.clawdbot/credentials/slack-token ]; then
    echo "✅ Slack token found"
else
    echo "⚠️  Slack token not found (optional)"
fi

if command -v imsg >/dev/null 2>&1; then
    echo "✅ imsg CLI found"
else
    echo "⚠️  imsg CLI not found (optional)"
    echo "   Install: npm install -g imsg"
fi

# Setup cron job
echo ""
echo "⏰ Setting up cron job..."

CRON_COMMAND="*/5 * * * * $SCRIPT_DIR/run-response-tracking.sh"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "run-response-tracking.sh"; then
    echo "✅ Cron job already exists"
else
    # Add to existing crontab
    (crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -
    echo "✅ Cron job added (runs every 5 minutes)"
fi

echo ""
echo "🧪 Running test..."

# Run a test
if "$SCRIPT_DIR/run-response-tracking.sh"; then
    echo "✅ Test run completed successfully"
else
    echo "❌ Test run failed - check logs"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure Executive OS is running: cd projects/executive-os && npm run dev"
echo "2. Test marking a message as done: $SCRIPT_DIR/message-tracking.sh \"test-123\" \"email_work\" \"Test User\" \"Test Subject\" \"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\""
echo "3. Check logs: tail -f $SCRIPT_DIR/response-tracking-master.log"
echo ""
echo "📊 The system will now automatically:"
echo "• Check for responses every 5 minutes"  
echo "• Mark messages as 'done' when you reply"
echo "• Track response times for all platforms"
echo "• Update the Executive OS dashboard"
echo ""
echo "🔧 To disable: crontab -e (remove the run-response-tracking.sh line)"