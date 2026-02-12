"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { MessageSource, UnifiedMessage, SourceMetrics } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCard } from "@/components/messaging/message-card";
import { SourceFilter } from "@/components/messaging/source-filter";
import { MetricsCards } from "@/components/messaging/metrics-cards";
import { ResponseTimeChart, MessageVolumeChart, SourceMetricsTable } from "@/components/messaging/response-chart";
import {
  ArrowLeft,
  Inbox,
  BarChart3,
  RefreshCw,
  Search,
  Filter,
  SortDesc,
  Clock,
  CheckCircle2,
  Circle,
  Sun,
  Moon,
} from "lucide-react";

type StatusFilter = "all" | "unread" | "pending" | "responded";
type SortOption = "newest" | "oldest" | "priority";

const ALL_SOURCES: MessageSource[] = [
  "slack",
  "teams_mention",
  "teams_dm",
  "email_work",
  "email_personal",
];

// Version tracking
const APP_VERSION = "v0.13";

interface ApiResponse {
  messages: UnifiedMessage[];
  sourceMetrics: SourceMetrics[];
  summaryMetrics: {
    totalMessages: number;
    pendingMessages: number;
    respondedMessages: number;
    avgResponseTime: number;
    responseRate: number;
    under30MinCount: number;
    under2HoursCount: number;
    over2HoursCount: number;
  };
  meta: {
    total: number;
    fetchedAt: string;
    duration: string;
    sources: Record<string, number>;
  };
}

export default function UnifiedMessagingDashboard() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // Default to dark
  });
  
  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  // State
  const [selectedSources, setSelectedSources] = useState<MessageSource[]>(ALL_SOURCES);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<UnifiedMessage | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data from API
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  
  // Locally marked as READ (in progress) with timestamps
  // Format: { [messageId]: timestamp }
  const [readData, setReadData] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('readMessageData');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse read data:', e);
        }
      }
    }
    return {};
  });
  
  // Locally marked as RESPONDED (done) with timestamps (persisted to localStorage)
  // Format: { [messageId]: timestamp }
  const [respondedData, setRespondedData] = useState<Record<string, number>>(() => {
    // Initialize from localStorage on client-side
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('respondedMessageData');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse responded data:', e);
        }
      }
      // Try migrating from old format
      const oldSaved = localStorage.getItem('respondedMessageIds');
      if (oldSaved) {
        try {
          const oldIds = JSON.parse(oldSaved) as string[];
          const migrated: Record<string, number> = {};
          oldIds.forEach(id => { migrated[id] = Date.now(); });
          localStorage.setItem('respondedMessageData', JSON.stringify(migrated));
          return migrated;
        } catch (e) {
          console.error('Failed to migrate old format:', e);
        }
      }
    }
    return {};
  });
  
  // Reset cutoff timestamp - only show messages received after this time
  const [resetCutoff, setResetCutoff] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messageResetCutoff');
      if (saved) {
        return parseInt(saved, 10);
      }
    }
    return 0; // No cutoff by default
  });
  
  // Derived sets for easy lookup
  const respondedIds = useMemo(() => new Set(Object.keys(respondedData)), [respondedData]);
  const readIds = useMemo(() => new Set(Object.keys(readData)), [readData]);
  
  // Handle marking a message as READ (in progress)
  const handleMarkRead = (messageId: string) => {
    const now = Date.now();
    
    // Update local state
    setReadData(prev => {
      const next = { ...prev, [messageId]: now };
      localStorage.setItem('readMessageData', JSON.stringify(next));
      return next;
    });
    
    // TODO: Persist to Supabase if needed
    console.log('📖 Marked as read:', messageId);
  };
  
  // Handle marking a message as responded (DONE)
  const handleMarkResponded = async (messageId: string) => {
    const now = Date.now();
    
    // Update local state immediately for responsive UI
    setRespondedData(prev => {
      const next = { ...prev, [messageId]: now };
      localStorage.setItem('respondedMessageData', JSON.stringify(next));
      return next;
    });
    
    // Remove from readData if it was there (it's now fully done)
    setReadData(prev => {
      if (prev[messageId]) {
        const next = { ...prev };
        delete next[messageId];
        localStorage.setItem('readMessageData', JSON.stringify(next));
        return next;
      }
      return prev;
    });

    // Find the message to get its details
    const message = rawMessages.find(m => m.id === messageId);
    
    // Persist to Supabase via API
    // IMPORTANT: Use messageId (with prefix like "icloud-123") as the key, not external_id
    try {
      const response = await fetch('/api/messages/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          externalId: messageId, // Use the SAME id as localStorage (with prefix)
          receivedAt: message?.received_at,
          channel: message?.source,
          sender: message?.sender_name,
          subject: message?.subject,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Supabase API error:', response.status, errorData);
      } else {
        const data = await response.json();
        console.log('✅ Response tracked in Supabase:', data);
      }
    } catch (err) {
      console.error('❌ Failed to persist response to Supabase:', err);
      // Local tracking still works as fallback
    }
  };
  
  // Reset all response tracking data AND set cutoff to only show new messages
  const handleResetStats = async () => {
    if (confirm('Reset stats and start fresh? This will hide all current messages and only track new ones going forward.')) {
      // Set cutoff to NOW - only messages received after this will be shown
      const now = Date.now();
      
      // Clear response and read tracking locally
      setRespondedData({});
      localStorage.removeItem('respondedMessageData');
      setReadData({});
      localStorage.removeItem('readMessageData');
      
      // Update local cutoff
      setResetCutoff(now);
      localStorage.setItem('messageResetCutoff', now.toString());
      
      // Sync to Supabase (reset tracking AND save cutoff)
      try {
        await fetch('/api/messages/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cutoff: now }),
        });
        console.log('✅ Supabase response tracking reset and cutoff synced');
      } catch (err) {
        console.error('Failed to reset Supabase:', err);
      }
      
      console.log('🔄 Response stats reset, cutoff set to:', new Date(now).toISOString());
    }
  };
  
  // Get current data (from API or fallback to empty)
  // Filter out messages received before the reset cutoff
  const rawMessages = useMemo(() => {
    const allMessages = apiData?.messages || [];
    if (resetCutoff === 0) return allMessages;
    
    return allMessages.filter(msg => {
      const receivedAt = new Date(msg.received_at).getTime();
      return receivedAt > resetCutoff;
    });
  }, [apiData?.messages, resetCutoff]);
  
  // Calculate responded today count
  const respondedTodayCount = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartMs = todayStart.getTime();
    
    return Object.values(respondedData).filter(ts => ts >= todayStartMs).length;
  }, [respondedData]);
  
  // Calculate read today count (in progress - worth 0.5)
  const readTodayCount = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartMs = todayStart.getTime();
    
    // Only count items that are read but NOT responded
    return Object.entries(readData)
      .filter(([id, ts]) => ts >= todayStartMs && !respondedData[id])
      .length;
  }, [readData, respondedData]);
  
  // Combined score (done = 1, read = 0.5)
  const todayScore = respondedTodayCount + (readTodayCount * 0.5);
  
  // Calculate average response time (minutes between received and done)
  const avgResponseTime = useMemo(() => {
    const responseTimes: number[] = [];
    
    for (const msg of rawMessages) {
      const respondedAt = respondedData[msg.id];
      if (respondedAt) {
        const receivedAt = new Date(msg.received_at).getTime();
        const responseTimeMinutes = Math.round((respondedAt - receivedAt) / 60000);
        if (responseTimeMinutes > 0) {
          responseTimes.push(responseTimeMinutes);
        }
      }
    }
    
    if (responseTimes.length === 0) return 0;
    return Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
  }, [rawMessages, respondedData]);

  // Apply local responded status to messages
  const messages = useMemo(() => rawMessages.map(msg => ({
    ...msg,
    status: respondedIds.has(msg.id) ? 'responded' as const : msg.status,
  })), [rawMessages, respondedIds]);
  
  const sourceMetrics = apiData?.sourceMetrics || [];
  
  // Recalculate summary metrics to reflect locally marked responses
  const summaryMetrics = useMemo(() => {
    // Only count non-responded messages for display
    const activeMessages = messages.filter(m => m.status !== 'responded');
    const respondedMessages = messages.filter(m => m.status === 'responded').length;
    const totalMessages = messages.length;
    const pendingMessages = activeMessages.length;
    const responseRate = totalMessages > 0 ? Math.round((respondedMessages / totalMessages) * 100) : 0;
    
    return {
      totalMessages,
      pendingMessages,
      respondedMessages,
      avgResponseTime, // Use our calculated avg response time
      responseRate,
      under30MinCount: 0,
      under2HoursCount: 0,
      over2HoursCount: 0,
    };
  }, [messages, avgResponseTime]);

  // Fetch data from API
  const fetchMessages = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching messages from API...');
      const response = await fetch('/api/messages');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data: ApiResponse = await response.json();
      setApiData(data);
      console.log('✅ Messages loaded:', data.meta);
      
    } catch (err) {
      console.error('❌ Failed to fetch messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMessages();
  }, []);

  // Sync responded data AND reset cutoff from Supabase on mount (enables cross-device sync)
  useEffect(() => {
    const syncWithSupabase = async () => {
      try {
        console.log('🔄 Syncing data with Supabase...');
        
        // 1. Fetch from Supabase
        const response = await fetch('/api/messages/responded');
        
        if (!response.ok) {
          console.warn('Failed to fetch data from Supabase');
          return;
        }
        
        const { responded: supabaseResponded, resetCutoff: supabaseCutoff } = await response.json();
        const supabaseIds = new Set(Object.keys(supabaseResponded || {}));
        
        // 2. Get local data
        const localData = JSON.parse(localStorage.getItem('respondedMessageData') || '{}');
        const localIds = Object.keys(localData);
        
        // 3. Find local entries NOT in Supabase (need to upload)
        const toUpload = localIds.filter(id => !supabaseIds.has(id));
        
        if (toUpload.length > 0) {
          console.log(`📤 Uploading ${toUpload.length} local entries to Supabase...`);
          
          // Upload missing entries to Supabase (in parallel, max 5 at a time)
          for (let i = 0; i < toUpload.length; i += 5) {
            const batch = toUpload.slice(i, i + 5);
            await Promise.all(batch.map(async (id) => {
              try {
                await fetch('/api/messages/respond', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    messageId: id,
                    externalId: id,
                    // Use stored timestamp as respondedAt, estimate receivedAt
                    receivedAt: new Date(localData[id] - 30 * 60000).toISOString(), // Assume 30min response
                    channel: 'migrated',
                  }),
                });
              } catch (err) {
                console.warn(`Failed to upload ${id}:`, err);
              }
            }));
          }
          console.log(`✅ Uploaded ${toUpload.length} entries to Supabase`);
        }
        
        // 4. Merge: Supabase overrides local
        const merged = { ...localData, ...(supabaseResponded || {}) };
        setRespondedData(merged);
        localStorage.setItem('respondedMessageData', JSON.stringify(merged));
        console.log(`✅ Synced ${Object.keys(supabaseResponded || {}).length} from Supabase, total: ${Object.keys(merged).length}`);
        
        // 5. Sync reset cutoff (use most recent - highest timestamp wins)
        if (supabaseCutoff && supabaseCutoff > 0) {
          setResetCutoff(prev => {
            const newCutoff = Math.max(prev, supabaseCutoff);
            if (newCutoff > prev) {
              localStorage.setItem('messageResetCutoff', newCutoff.toString());
              console.log(`✅ Synced reset cutoff from Supabase: ${new Date(newCutoff).toISOString()}`);
            }
            return newCutoff;
          });
        }
      } catch (err) {
        console.error('Failed to sync with Supabase:', err);
      }
    };
    
    syncWithSupabase();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages(false); // Silent refresh
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Auto-mark emails that are "read" in source as "in progress" locally
  useEffect(() => {
    if (!rawMessages.length) return;
    
    const newReadEntries: Record<string, number> = {};
    
    for (const msg of rawMessages) {
      // If message is read at source, not already marked read locally, and not done
      if (msg.status === 'read' && !readData[msg.id] && !respondedData[msg.id]) {
        // Use received time as the "read" time (approximate)
        newReadEntries[msg.id] = new Date(msg.received_at).getTime();
      }
    }
    
    if (Object.keys(newReadEntries).length > 0) {
      console.log(`📖 Auto-marking ${Object.keys(newReadEntries).length} read emails as in-progress`);
      setReadData(prev => {
        const next = { ...prev, ...newReadEntries };
        localStorage.setItem('readMessageData', JSON.stringify(next));
        return next;
      });
    }
  }, [rawMessages, readData, respondedData]);

  // Count messages by source
  const sourceCounts = useMemo(() => {
    return ALL_SOURCES.reduce((acc, source) => {
      acc[source] = messages.filter((m) => m.source === source && m.status !== "responded").length;
      return acc;
    }, {} as Record<MessageSource, number>);
  }, [messages]);

  // Filter and sort messages
  const filteredMessages = useMemo(() => {
    let filteredMsgs = [...messages];

    // Filter by source
    if (selectedSources.length < ALL_SOURCES.length) {
      filteredMsgs = filteredMsgs.filter((m) => selectedSources.includes(m.source));
    }

    // Filter by status
    if (statusFilter === "unread") {
      filteredMsgs = filteredMsgs.filter((m) => m.status === "unread");
    } else if (statusFilter === "pending") {
      filteredMsgs = filteredMsgs.filter((m) => m.status !== "responded");
    } else if (statusFilter === "responded") {
      filteredMsgs = filteredMsgs.filter((m) => m.status === "responded");
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredMsgs = filteredMsgs.filter(
        (m) =>
          m.sender_name.toLowerCase().includes(query) ||
          m.preview.toLowerCase().includes(query) ||
          m.subject?.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === "newest") {
      filteredMsgs.sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
    } else if (sortBy === "oldest") {
      filteredMsgs.sort((a, b) => new Date(a.received_at).getTime() - new Date(b.received_at).getTime());
    } else if (sortBy === "priority") {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      filteredMsgs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    return filteredMsgs;
  }, [messages, selectedSources, statusFilter, sortBy, searchQuery]);

  // Toggle source selection
  const toggleSource = (source: MessageSource) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter((s) => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessages(false);
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden">
      {/* Header - pt-safe adds padding for notch/dynamic island */}
      <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)] pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <Link
                href="/admin"
                className="p-2 -ml-2 rounded-lg hover:bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <h1 className="text-sm md:text-lg font-semibold text-[var(--foreground)] truncate">
                    <span className="md:hidden">Messages</span>
                    <span className="hidden md:inline">Message Responsiveness</span>
                  </h1>
                  <span className="text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded bg-[var(--background-secondary)] text-[var(--foreground-muted)] flex-shrink-0">{APP_VERSION}</span>
                </div>
                <p className="text-[10px] md:text-xs text-[var(--foreground-muted)]">
                  {summaryMetrics.pendingMessages} pending
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Theme toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 md:p-2 rounded-lg hover:bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-all"
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
              
              {/* Reset Stats button - hide on mobile, show on desktop */}
              {Object.keys(respondedData).length > 0 && (
                <button
                  onClick={handleResetStats}
                  className="hidden md:block px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Reset Stats
                </button>
              )}
              <button
                onClick={handleRefresh}
                className={cn(
                  "p-1.5 md:p-2 rounded-lg hover:bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-all",
                  isRefreshing && "animate-spin"
                )}
              >
                <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Metrics Overview */}
        <section className="mb-6">
          <MetricsCards
            totalMessages={summaryMetrics.totalMessages}
            pendingMessages={summaryMetrics.pendingMessages}
            respondedMessages={summaryMetrics.respondedMessages}
            respondedToday={respondedTodayCount}
            readToday={readTodayCount}
            avgResponseTime={summaryMetrics.avgResponseTime}
            responseRate={summaryMetrics.responseRate}
          />
        </section>

        {/* Tabs: Inbox & Analytics */}
        <Tabs defaultValue="inbox" className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList>
              <TabsTrigger value="inbox">
                <Inbox className="w-4 h-4 mr-1.5" />
                Inbox
                {summaryMetrics.pendingMessages > 0 && (
                  <Badge variant="primary" size="xs" className="ml-2">
                    {summaryMetrics.pendingMessages}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="w-4 h-4 mr-1.5" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Search - visible on inbox tab */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--sonance-blue)]/30 focus:border-[var(--sonance-blue)] transition-all"
              />
            </div>
          </div>

          {/* Inbox Tab */}
          <TabsContent value="inbox">
            {/* Filters */}
            <div className="space-y-4 mb-6">
              {/* Source filter */}
              <SourceFilter
                sources={ALL_SOURCES}
                selectedSources={selectedSources}
                onToggle={toggleSource}
                counts={sourceCounts}
              />

              {/* Status + Sort */}
              <div className="flex items-center gap-4 flex-wrap">
                {/* Status filter pills */}
                <div className="flex items-center gap-1 bg-[var(--background-secondary)] p-1 rounded-xl border border-[var(--border)]">
                  {[
                    { value: "all", label: "All", icon: null },
                    { value: "unread", label: "Unread", icon: Circle },
                    { value: "pending", label: "Pending", icon: Clock },
                    { value: "responded", label: "Responded", icon: CheckCircle2 },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setStatusFilter(item.value as StatusFilter)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                        statusFilter === item.value
                          ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                          : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                      )}
                    >
                      {item.icon && <item.icon className="w-3 h-3" />}
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2 ml-auto">
                  <SortDesc className="w-4 h-4 text-[var(--foreground-muted)]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-sm bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--sonance-blue)]/30"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Message List */}
            <div className="space-y-3">
              {!isLoading && !error && filteredMessages.length === 0 && (
                <Card className="py-12">
                  <div className="text-center">
                    <Inbox className="w-12 h-12 mx-auto mb-3 text-[var(--foreground-muted)]" />
                    <p className="text-[var(--foreground-secondary)] font-medium">No messages found</p>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                </Card>
              )}
              
              {!isLoading && !error && filteredMessages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  onSelect={setSelectedMessage}
                  onMarkRead={handleMarkRead}
                  onMarkResponded={handleMarkResponded}
                  isSelected={selectedMessage?.id === message.id}
                  isRead={readIds.has(message.id)}
                />
              ))}
            </div>

            {/* Loading state */}
            {isLoading && (
              <Card className="py-12">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 mx-auto mb-3 text-[var(--foreground-muted)] animate-spin" />
                  <p className="text-[var(--foreground-secondary)] font-medium">Loading messages...</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Fetching from all sources
                  </p>
                </div>
              </Card>
            )}

            {/* Error state */}
            {error && !isLoading && (
              <Card className="py-8 border-red-200 bg-red-50">
                <div className="text-center">
                  <p className="text-red-800 font-medium mb-2">Failed to load messages</p>
                  <p className="text-sm text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => fetchMessages()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </Card>
            )}

            {/* Message count */}
            {!isLoading && !error && filteredMessages.length > 0 && (
              <p className="text-center text-xs text-[var(--foreground-muted)] mt-4">
                Showing {filteredMessages.length} of {messages.length} messages
                {apiData?.meta && (
                  <span className="ml-2 text-green-600">
                    • Last updated: {new Date(apiData.meta.fetchedAt).toLocaleTimeString()}
                  </span>
                )}
              </p>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Response Time Chart */}
              <ResponseTimeChart metrics={sourceMetrics} />

              {/* Message Volume Chart */}
              <MessageVolumeChart metrics={sourceMetrics} />

              {/* Detailed Table - Full width */}
              <div className="lg:col-span-2">
                <SourceMetricsTable metrics={sourceMetrics} />
              </div>

              {/* Response Time Distribution */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Response Time Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-3xl font-semibold text-emerald-600">{summaryMetrics.under30MinCount}</p>
                      <p className="text-xs text-[var(--foreground-muted)] mt-1">Under 30 min</p>
                      <div className="mt-2 h-2 bg-emerald-500/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${(summaryMetrics.under30MinCount / summaryMetrics.respondedMessages) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-3xl font-semibold text-amber-600">
                        {summaryMetrics.under2HoursCount - summaryMetrics.under30MinCount}
                      </p>
                      <p className="text-xs text-[var(--foreground-muted)] mt-1">30 min - 2 hours</p>
                      <div className="mt-2 h-2 bg-amber-500/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{
                            width: `${((summaryMetrics.under2HoursCount - summaryMetrics.under30MinCount) / summaryMetrics.respondedMessages) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <p className="text-3xl font-semibold text-red-600">{summaryMetrics.over2HoursCount}</p>
                      <p className="text-xs text-[var(--foreground-muted)] mt-1">Over 2 hours</p>
                      <div className="mt-2 h-2 bg-red-500/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{
                            width: `${(summaryMetrics.over2HoursCount / summaryMetrics.respondedMessages) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
