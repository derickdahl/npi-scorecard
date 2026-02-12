'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient, Executive } from '@/lib/supabase'

// Simple bar component
function Bar({ value, max, color }: { value: number, max: number, color: string }) {
  const width = Math.min((value / max) * 100, 100)
  return (
    <div className="w-full bg-gray-500/30 rounded-full h-3">
      <div 
        className={`h-3 rounded-full ${color}`} 
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

// Default executive data (works without Supabase)
const getDefaultExecutive = (slug: string): Executive => ({
  id: 'demo',
  name: 'Derick Dahl',
  email: 'derickd@sonance.com',
  slug: slug,
  title: 'Head of Technology & Innovation',
  company: 'Sonance',
  profile: {},
  settings: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

interface MetricsData {
  summary: {
    totalMessages: number
    pendingMessages: number
    respondedMessages: number
    avgResponseTimeHours: number
    responseRate: number
  }
  responseByChannel: Record<string, { avg: number; target: number; count: number }>
  lastUpdated: string
}

const channelLabels: Record<string, string> = {
  email_work: 'Work Email',
  email_personal: 'Personal Email',
  slack: 'Slack',
  teams_mention: 'Teams @Mentions',
  teams_dm: 'Teams DM',
}

export default function PublicDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>('')
  const [executive, setExecutive] = useState<Executive | null>(null)
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(p => {
      setSlug(p.slug)
      setExecutive(getDefaultExecutive(p.slug))
    })
  }, [params])

  useEffect(() => {
    if (!slug) return
    
    async function loadData() {
      try {
        // Load executive from Supabase
        try {
          const supabase = createClient()
          const { data } = await supabase
            .from('executives')
            .select('*')
            .eq('slug', slug)
            .single()
          
          if (data) setExecutive(data)
        } catch {
          // Supabase not configured, using default data
        }

        // Load real metrics from API
        const res = await fetch('/api/metrics')
        if (res.ok) {
          const data = await res.json()
          setMetrics(data)
        }
      } catch (e) {
        console.error('Error loading data:', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()

    // Refresh metrics every 2 minutes
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/metrics')
        if (res.ok) {
          const data = await res.json()
          setMetrics(data)
        }
      } catch {
        // Ignore refresh errors
      }
    }, 120000)

    return () => clearInterval(interval)
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-sonance-charcoal flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!executive) {
    return (
      <div className="min-h-screen bg-sonance-charcoal flex items-center justify-center">
        <div className="text-white">Executive not found</div>
      </div>
    )
  }

  // Use real data or fallback to demo
  const summary = metrics?.summary || {
    totalMessages: 0,
    pendingMessages: 0,
    respondedMessages: 0,
    avgResponseTimeHours: 0,
    responseRate: 0,
  }

  const responseByChannel = metrics?.responseByChannel || {}

  // Filter to channels with actual data
  const activeChannels = Object.entries(responseByChannel)
    .filter(([, data]) => data.count > 0)
    .sort((a, b) => b[1].count - a[1].count)

  const maxAvg = activeChannels.length > 0 
    ? Math.max(...activeChannels.map(([, d]) => d.avg)) * 1.2 
    : 10

  return (
    <div className="min-h-screen bg-sonance-charcoal text-white">
      {/* Header */}
      <header className="border-b border-gray-500/30 bg-sonance-charcoal/80 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Executive<span className="text-sonance-beam">OS</span>
          </Link>
          <div className="text-sm text-gray-100/70">
            Public Dashboard
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Executive Card */}
        <div className="bg-gradient-to-r from-gray-900/80 to-gray-900/40 rounded-xl p-6 md:p-8 mb-8 border border-gray-500/20">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-sonance-beam flex-shrink-0">
              <Image 
                src="/headshot-derick.png" 
                alt={executive.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{executive.name}</h1>
              <p className="text-gray-100/70 text-sm md:text-base">{executive.title}</p>
              <p className="text-gray-500 text-xs md:text-sm">{executive.company}</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="bg-gray-900/50 rounded-xl p-4 md:p-6">
            <div className="text-xs md:text-sm text-gray-100/70 mb-1 md:mb-2">Avg Response Time</div>
            <div className={`text-2xl md:text-4xl font-bold ${summary.avgResponseTimeHours <= 4 ? 'text-green-400' : summary.avgResponseTimeHours <= 8 ? 'text-yellow-400' : 'text-red-400'}`}>
              {summary.avgResponseTimeHours > 0 ? `${summary.avgResponseTimeHours} hrs` : '—'}
            </div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">
              {summary.pendingMessages} pending
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 md:p-6">
            <div className="text-xs md:text-sm text-gray-100/70 mb-1 md:mb-2">Response Rate</div>
            <div className={`text-2xl md:text-4xl font-bold ${summary.responseRate >= 90 ? 'text-green-400' : summary.responseRate >= 70 ? 'text-yellow-400' : 'text-white'}`}>
              {summary.responseRate > 0 ? `${summary.responseRate}%` : '—'}
            </div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">
              {summary.respondedMessages} of {summary.totalMessages}
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 md:p-6 col-span-2 md:col-span-1">
            <div className="text-xs md:text-sm text-gray-100/70 mb-1 md:mb-2">Messages Tracked</div>
            <div className="text-2xl md:text-4xl font-bold text-sonance-beam">
              {summary.totalMessages}
            </div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">
              across all channels
            </div>
          </div>
        </div>

        {/* Response Time by Channel */}
        {activeChannels.length > 0 && (
          <div className="bg-gray-900/50 rounded-xl p-4 md:p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 md:mb-6">Response Time by Channel</h3>
            <div className="space-y-4">
              {activeChannels.map(([channel, data]) => (
                <div key={channel}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      {channelLabels[channel] || channel}
                      <span className="text-gray-500 text-xs">({data.count})</span>
                    </span>
                    <span className={data.avg <= data.target ? 'text-green-400' : 'text-yellow-400'}>
                      {data.avg > 0 ? `${data.avg} hrs` : '—'}
                      <span className="text-gray-500 ml-2 hidden sm:inline">(target: {data.target}h)</span>
                    </span>
                  </div>
                  <Bar 
                    value={data.avg} 
                    max={maxAvg} 
                    color={data.avg <= data.target ? 'bg-green-500' : 'bg-yellow-500'} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Status */}
        <div className="bg-gray-900/50 rounded-xl p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Current Status</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400">Available</span>
            </div>
            <span className="text-gray-500 hidden sm:inline">•</span>
            <span className="text-gray-100/70 text-sm">
              Best time to reach: 9am - 11am, 2pm - 4pm (Pacific)
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 md:mt-12 text-center text-gray-500 text-xs md:text-sm">
          <div>Powered by Executive<span className="text-sonance-beam">OS</span></div>
          {metrics?.lastUpdated && (
            <div className="mt-1 text-gray-600">
              Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
