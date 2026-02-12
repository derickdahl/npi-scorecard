"use client";

import { MessageSource, SOURCE_CONFIG } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { SourceIcon, getSourceLabel } from "./source-icon";

interface SourceFilterProps {
  sources: MessageSource[];
  selectedSources: MessageSource[];
  onToggle: (source: MessageSource) => void;
  counts?: Record<MessageSource, number>;
}

export function SourceFilter({ sources, selectedSources, onToggle, counts }: SourceFilterProps) {
  const allSelected = selectedSources.length === sources.length;

  return (
    <div className="flex flex-wrap gap-2">
      {/* All button */}
      <button
        onClick={() => {
          if (allSelected) {
            // If all selected, deselect all
            sources.forEach(s => {
              if (selectedSources.includes(s)) onToggle(s);
            });
          } else {
            // Select all
            sources.forEach(s => {
              if (!selectedSources.includes(s)) onToggle(s);
            });
          }
        }}
        className={cn(
          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border",
          allSelected
            ? "bg-[var(--sonance-charcoal)] text-white border-[var(--sonance-charcoal)]"
            : "bg-transparent text-[var(--foreground-muted)] border-[var(--border)] hover:border-[var(--border-hover)]"
        )}
      >
        All
      </button>

      {sources.map((source) => {
        const isSelected = selectedSources.includes(source);
        const config = SOURCE_CONFIG[source];
        const count = counts?.[source] || 0;

        return (
          <button
            key={source}
            onClick={() => onToggle(source)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border",
              isSelected
                ? "border-current"
                : "bg-transparent text-[var(--foreground-muted)] border-[var(--border)] hover:border-[var(--border-hover)]"
            )}
            style={isSelected ? {
              backgroundColor: `${config.color}15`,
              color: config.color,
              borderColor: `${config.color}40`
            } : {}}
          >
            <SourceIcon source={source} size={14} />
            <span>{getSourceLabel(source)}</span>
            {count > 0 && (
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px]",
                isSelected ? "bg-white/20" : "bg-[var(--background-secondary)]"
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
