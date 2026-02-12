"use client";

import { MessageSource } from "@/lib/supabase";
import { Mail, MessageSquare, AtSign, Users } from "lucide-react";

interface SourceIconProps {
  source: MessageSource;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export function SourceIcon({ source, className, size = 16, style }: SourceIconProps) {
  const iconProps = { className, size, style };

  switch (source) {
    case "slack":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          style={style}
        >
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
        </svg>
      );
    case "teams_mention":
      return <AtSign {...iconProps} />;
    case "teams_dm":
      return <Users {...iconProps} />;
    case "email_work":
    case "email_personal":
      return <Mail {...iconProps} />;
    case "imessage":
      return <MessageSquare {...iconProps} />;
    default:
      return <Mail {...iconProps} />;
  }
}

export function getSourceColor(source: MessageSource): string {
  switch (source) {
    case "slack":
      return "#4A154B";
    case "teams_mention":
    case "teams_dm":
      return "#6264A7";
    case "email_work":
      return "#00A3E1";
    case "email_personal":
      return "#007AFF";
    case "imessage":
      return "#34C759";
    default:
      return "#6b7780";
  }
}

export function getSourceLabel(source: MessageSource): string {
  switch (source) {
    case "slack":
      return "Slack";
    case "teams_mention":
      return "Teams @";
    case "teams_dm":
      return "Teams DM";
    case "email_work":
      return "Work Email";
    case "email_personal":
      return "Personal";
    case "imessage":
      return "iMessage";
    default:
      return source;
  }
}

export function getSourceBadgeVariant(source: MessageSource): "slack" | "teams" | "email" | "imessage" | "default" {
  switch (source) {
    case "slack":
      return "slack";
    case "teams_mention":
    case "teams_dm":
      return "teams";
    case "email_work":
    case "email_personal":
      return "email";
    case "imessage":
      return "imessage";
    default:
      return "default";
  }
}
