"use client";

import { UnifiedMessage } from "@/lib/supabase";
import { cn, formatRelativeTime, formatResponseTime, getResponseTimeColor, getResponseTimeBgColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SourceIcon, getSourceLabel, getSourceBadgeVariant } from "./source-icon";
import { Clock, ExternalLink, CheckCircle2, Circle, Check } from "lucide-react";

interface MessageCardProps {
  message: UnifiedMessage;
  onSelect?: (message: UnifiedMessage) => void;
  onMarkRead?: (messageId: string) => void;
  onMarkResponded?: (messageId: string) => void;
  isSelected?: boolean;
  isRead?: boolean; // In progress state
}

export function MessageCard({ message, onSelect, onMarkRead, onMarkResponded, isSelected, isRead }: MessageCardProps) {
  const receivedDate = new Date(message.received_at);
  const now = new Date();
  const elapsedMinutes = Math.floor((now.getTime() - receivedDate.getTime()) / 60000);

  const hasResponded = message.status === "responded";
  const hasRead = isRead && !hasResponded; // Read but not done
  const responseTime = hasResponded ? message.response_time_minutes : elapsedMinutes;

  const handleClick = () => {
    if (!message.deep_link) {
      onSelect?.(message);
      return;
    }

    // Detect mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    // For Outlook emails on mobile, use app URI scheme
    if (message.source === 'email_work' && isMobile && message.external_id) {
      // Extract ItemID from the webLink (OWA format)
      const itemIdMatch = message.deep_link?.match(/ItemID=([^&]+)/);
      const itemId = itemIdMatch ? decodeURIComponent(itemIdMatch[1]) : null;
      
      // Outlook iOS deep link formats to try:
      // 1. ms-outlook://emails?itemid={owaItemId} - OWA item ID
      // 2. ms-outlook://emails?restid={graphId} - Graph API ID  
      // 3. ms-outlook://view?type=email&id={id} - View format
      
      let outlookAppUrl: string;
      if (itemId) {
        // Use OWA ItemID format - most reliable
        outlookAppUrl = `ms-outlook://emails?itemid=${encodeURIComponent(itemId)}`;
      } else {
        // Fallback to Graph ID
        outlookAppUrl = `ms-outlook://emails?restid=${encodeURIComponent(message.external_id)}`;
      }
      
      console.log('Outlook deep link:', outlookAppUrl);
      
      if (isIOS) {
        const webUrl = message.deep_link;
        const start = Date.now();
        window.location.href = outlookAppUrl;
        
        // Fallback to web after 2s if app doesn't handle it
        setTimeout(() => {
          if (Date.now() - start < 2500) {
            window.location.href = webUrl;
          }
        }, 2000);
      } else {
        window.location.href = outlookAppUrl;
      }
    } else if (message.source.includes('teams') && isMobile) {
      // Teams app link
      const teamsAppUrl = message.deep_link.replace('https://teams.microsoft.com', 'msteams://teams.microsoft.com');
      window.location.href = teamsAppUrl;
    } else {
      // Desktop or other sources - use web link
      window.open(message.deep_link, '_blank', 'noopener,noreferrer');
    }
    
    onSelect?.(message);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group p-4 rounded-xl border transition-all duration-200 cursor-pointer",
        "hover:shadow-lg hover:border-[var(--border-hover)]",
        "active:scale-[0.99]", // Feedback on tap
        isSelected
          ? "border-[var(--sonance-blue)] bg-[var(--sonance-blue)]/5"
          : message.status === "unread"
          ? "border-[var(--border)] bg-[var(--background)]"
          : "border-[var(--border)] bg-[var(--background-secondary)]"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar / Source Icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${getSourceLabel(message.source) === "Slack" ? "#4A154B" : message.source.includes("teams") ? "#6264A7" : message.source.includes("email") ? "#00A3E1" : "#34C759"}20` }}
        >
          <SourceIcon
            source={message.source}
            size={20}
            className="opacity-80"
            style={{ color: getSourceLabel(message.source) === "Slack" ? "#4A154B" : message.source.includes("teams") ? "#6264A7" : message.source.includes("email") ? "#00A3E1" : "#34C759" }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Unread indicator */}
            {message.status === "unread" && (
              <Circle className="w-2 h-2 fill-[var(--sonance-blue)] text-[var(--sonance-blue)]" />
            )}

            {/* Sender name */}
            <span className={cn(
              "font-medium text-sm truncate",
              message.status === "unread" ? "text-[var(--foreground)]" : "text-[var(--foreground-secondary)]"
            )}>
              {message.sender_name}
            </span>

            {/* Source badge */}
            <Badge variant={getSourceBadgeVariant(message.source)} size="xs">
              {getSourceLabel(message.source)}
            </Badge>

            {/* Time */}
            <span className="text-xs text-[var(--foreground-muted)] ml-auto shrink-0">
              {formatRelativeTime(receivedDate)}
            </span>
          </div>

          {/* Subject (if email) */}
          {message.subject && (
            <p className={cn(
              "text-sm truncate mb-0.5",
              message.status === "unread" ? "font-medium text-[var(--foreground)]" : "text-[var(--foreground-secondary)]"
            )}>
              {message.subject}
            </p>
          )}

          {/* Preview */}
          <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">
            {message.preview}
          </p>

          {/* Bottom row: Response time & actions */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Response time indicator */}
            <div className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-md text-xs shrink-0",
              hasResponded
                ? "bg-emerald-500/10 text-emerald-600"
                : getResponseTimeBgColor(responseTime || 0)
            )}>
              {hasResponded ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Responded in {formatResponseTime(message.response_time_minutes || 0)}</span>
                  <span className="sm:hidden">{formatResponseTime(message.response_time_minutes || 0)}</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" />
                  <span className={cn(getResponseTimeColor(responseTime || 0), "hidden sm:inline")}>
                    Waiting {formatResponseTime(responseTime || 0)}
                  </span>
                  <span className={cn(getResponseTimeColor(responseTime || 0), "sm:hidden")}>
                    {formatResponseTime(responseTime || 0)}
                  </span>
                </>
              )}
            </div>

            {/* Channel name (if applicable) - hide on mobile */}
            {message.channel_name && (
              <span className="hidden sm:inline text-xs text-[var(--foreground-muted)]">
                #{message.channel_name}
              </span>
            )}

            {/* Spacer to push buttons right */}
            <div className="flex-1" />

            {/* Mark as Read button - shows when not read or done */}
            {onMarkRead && !hasRead && !hasResponded && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(message.id);
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all shrink-0",
                  "border border-amber-500 text-amber-600 bg-transparent font-normal hover:bg-amber-500 hover:text-white active:scale-95"
                )}
              >
                <Circle className="w-3 h-3" />
                <span>Read</span>
              </button>
            )}
            
            {/* Read indicator - shows when read but not done */}
            {hasRead && !hasResponded && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-amber-500/20 text-amber-600 font-medium shrink-0">
                <Circle className="w-3 h-3 fill-amber-500" />
                <span className="hidden sm:inline">In Progress</span>
                <span className="sm:hidden">WIP</span>
              </div>
            )}
            
            {/* Mark as Done button */}
            {onMarkResponded && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!hasResponded) {
                    onMarkResponded(message.id);
                  }
                }}
                disabled={hasResponded}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all shrink-0",
                  hasResponded
                    ? "bg-emerald-500 text-white font-semibold cursor-default"
                    : "border border-emerald-500 text-emerald-600 bg-transparent font-normal hover:bg-emerald-500 hover:text-white active:scale-95"
                )}
              >
                <Check className="w-3 h-3" />
                <span>Done</span>
              </button>
            )}

            {/* Open in app indicator - icon only on mobile */}
            {message.deep_link && (
              <ExternalLink className="w-4 h-4 text-[var(--foreground-muted)] shrink-0" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
