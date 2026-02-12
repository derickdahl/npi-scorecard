#!/bin/bash
# Executive OS - Master Response Tracking Script
# Runs all platform integrations to mark messages as done

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$SCRIPT_DIR/response-tracking-master.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🤖 Starting Executive OS response tracking..."

# Array of integration scripts to run
INTEGRATIONS=(
    "integrations/email-response-tracker.sh"
    "integrations/teams-response-tracker.sh"
    "integrations/slack-response-tracker.sh"
    "integrations/imessage-response-tracker.sh"
)

# Run each integration
for integration in "${INTEGRATIONS[@]}"; do
    integration_path="$SCRIPT_DIR/$integration"
    integration_name=$(basename "$integration" .sh)
    
    if [ -f "$integration_path" ]; then
        log "📧 Running $integration_name..."
        
        # Make sure the script is executable
        chmod +x "$integration_path"
        
        # Run the integration with timeout (5 minutes max per platform)
        if timeout 300 "$integration_path" >> "$LOG_FILE" 2>&1; then
            log "✅ $integration_name completed successfully"
        else
            exit_code=$?
            if [ $exit_code -eq 124 ]; then
                log "⏰ $integration_name timed out (5 minutes)"
            else
                log "❌ $integration_name failed with exit code $exit_code"
            fi
        fi
    else
        log "⚠️ Integration script not found: $integration_path"
    fi
    
    # Small delay between integrations
    sleep 2
done

# Optional: Clean up old log entries (keep last 1000 lines)
if [ -f "$LOG_FILE" ]; then
    tail -n 1000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi

log "🏁 Executive OS response tracking complete"

# Optional: Report summary to Executive OS dashboard
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXECUTIVE_OS_URL="${EXECUTIVE_OS_URL:-https://executive-os-eight.vercel.app}"

# Call heartbeat endpoint to update dashboard
curl -s -X POST "$EXECUTIVE_OS_URL/api/system/heartbeat" \
    -H "Content-Type: application/json" \
    -d "{
        \"component\": \"response-tracking\",
        \"status\": \"completed\",
        \"timestamp\": \"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\"
    }" > /dev/null 2>&1 || true

log "📊 Heartbeat sent to Executive OS dashboard"