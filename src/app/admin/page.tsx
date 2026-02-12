'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient, Executive } from '@/lib/supabase'

// Default executive data (works without Supabase)
const DEFAULT_EXECUTIVE: Executive = {
  id: 'demo',
  name: 'Derick Dahl',
  email: 'derickd@sonance.com',
  slug: 'derick',
  title: 'Head of Technology & Innovation',
  company: 'Sonance',
  profile: {},
  settings: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export default function AdminDashboard() {
  const [executive, setExecutive] = useState<Executive>(DEFAULT_EXECUTIVE)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadExecutive() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('executives')
          .select('*')
          .eq('slug', 'derick')
          .single()
        
        if (data) setExecutive(data)
      } catch (e) {
        // Supabase not configured, using default data
      }
    }
    loadExecutive()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-sonance-charcoal flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sonance-charcoal text-white">
      {/* Header */}
      <header className="border-b border-gray-500/30 bg-sonance-charcoal/80 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold">
              Executive<span className="text-sonance-beam">OS</span>
            </Link>
            <span className="text-gray-500">|</span>
            <span className="text-gray-100/70">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-100/70">{executive?.name}</span>
            <Link 
              href={`/dashboard/${executive?.slug}`}
              className="text-sm text-sonance-beam hover:text-sonance-beam/80"
            >
              View Public Dashboard →
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Response Time', value: '2.4 hrs', change: '↓ 40%', color: 'text-green-400' },
            { label: 'Response Rate', value: '94%', change: '↑ 12%', color: 'text-green-400' },
            { label: 'Auto-Handled', value: '23', change: 'this week', color: 'text-sonance-beam' },
            { label: 'Time Saved', value: '12 hrs', change: 'this week', color: 'text-purple-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-900/50 rounded-lg p-4 border border-gray-500/20">
              <div className="text-sm text-gray-100/60 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`text-sm ${stat.color}`}>{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Featured: Unified Messages Dashboard */}
        <Link href="/admin/messages" className="block mb-8 group">
          <div className="bg-gradient-to-r from-sonance-beam/20 to-purple-500/20 border border-sonance-beam/30 rounded-xl p-6 hover:border-sonance-beam/60 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📬</div>
                <div>
                  <h3 className="text-xl font-semibold group-hover:text-sonance-beam transition-colors">
                    Unified Messages Dashboard
                  </h3>
                  <p className="text-sm text-gray-100/60 mt-1">
                    View all correspondence from Slack, Teams, Email, and iMessage in one place. Track response metrics and SLAs.
                  </p>
                </div>
              </div>
              <div className="text-sonance-beam">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Main Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Navigation Cards */}
          {[
            {
              title: 'Executive Profile',
              desc: 'Your preferences, VIPs, calendar settings, and personal info',
              href: '/admin/profile',
              icon: '👤',
            },
            {
              title: 'Response Rules',
              desc: 'Configure auto-response rules and conditions',
              href: '/admin/rules',
              icon: '⚡',
            },
            {
              title: 'Templates',
              desc: 'Manage response templates and copy',
              href: '/admin/templates',
              icon: '📝',
            },
            {
              title: 'Channel Settings',
              desc: 'Configure Email, Teams, Slack, and iMessage',
              href: '/admin/channels',
              icon: '📱',
            },
            {
              title: 'VIP Contacts',
              desc: 'Manage priority contacts and relationships',
              href: '/admin/vips',
              icon: '⭐',
            },
            {
              title: 'Delegation',
              desc: 'Set what L3 can handle autonomously',
              href: '/admin/delegation',
              icon: '🤖',
            },
          ].map((card, i) => (
            <Link key={i} href={card.href} className="group">
              <div className="bg-gray-900/50 border border-gray-500/20 rounded-xl p-6 hover:border-sonance-beam/50 transition-all h-full">
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-sonance-beam transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-100/60">{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex gap-4">
            <button className="bg-sonance-beam hover:bg-sonance-beam/80 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Sync Data Now
            </button>
            <button className="bg-gray-500/30 hover:bg-gray-500/40 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Export Report
            </button>
            <button className="bg-gray-500/30 hover:bg-gray-500/40 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              View Activity Log
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="bg-gray-900/50 rounded-lg divide-y divide-gray-500/20 border border-gray-500/20">
            {[
              { time: '5 min ago', action: 'Auto-responded to meeting request', channel: 'Email' },
              { time: '23 min ago', action: 'Acknowledged status inquiry', channel: 'Teams' },
              { time: '1 hr ago', action: 'Escalated urgent message', channel: 'Slack' },
              { time: '2 hrs ago', action: 'Created task from email', channel: 'Email' },
            ].map((activity, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm">{activity.action}</div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
                <span className="text-xs bg-gray-500/20 px-2 py-1 rounded">{activity.channel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
