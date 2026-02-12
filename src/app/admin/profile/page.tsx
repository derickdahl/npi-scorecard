'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient, Executive } from '@/lib/supabase'

export default function ProfilePage() {
  const [executive, setExecutive] = useState<Executive | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    async function loadExecutive() {
      const supabase = createClient()
      const { data } = await supabase
        .from('executives')
        .select('*')
        .eq('slug', 'derick')
        .single()
      
      if (data) setExecutive(data)
      setLoading(false)
    }
    loadExecutive()
  }, [])

  const handleSave = async () => {
    if (!executive) return
    setSaving(true)
    
    const supabase = createClient()
    await supabase
      .from('executives')
      .update({
        name: executive.name,
        email: executive.email,
        title: executive.title,
        company: executive.company,
        profile: executive.profile,
        settings: executive.settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', executive.id)
    
    setSaving(false)
  }

  const updateProfile = (key: string, value: any) => {
    if (!executive) return
    setExecutive({
      ...executive,
      profile: {
        ...executive.profile,
        [key]: value
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sonance-charcoal flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'communication', label: 'Communication' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'travel', label: 'Travel' },
    { id: 'family', label: 'Family' },
    { id: 'vips', label: 'VIPs' },
  ]

  return (
    <div className="min-h-screen bg-sonance-charcoal text-white">
      {/* Header */}
      <header className="border-b border-gray-500/30 bg-sonance-charcoal/80 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-100/70 hover:text-white">
              ← Back
            </Link>
            <span className="text-gray-500">|</span>
            <span className="font-semibold">Executive Profile</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-sonance-beam hover:bg-sonance-beam/80 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-sonance-beam text-white'
                  : 'bg-gray-900/50 text-gray-100/70 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-2xl">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              
              <div>
                <label className="block text-sm text-gray-100/70 mb-2">Full Name</label>
                <input
                  type="text"
                  value={executive?.name || ''}
                  onChange={(e) => setExecutive(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-100/70 mb-2">Email</label>
                <input
                  type="email"
                  value={executive?.email || ''}
                  onChange={(e) => setExecutive(prev => prev ? {...prev, email: e.target.value} : null)}
                  className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-100/70 mb-2">Title</label>
                <input
                  type="text"
                  value={executive?.title || ''}
                  onChange={(e) => setExecutive(prev => prev ? {...prev, title: e.target.value} : null)}
                  className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-100/70 mb-2">Company</label>
                <input
                  type="text"
                  value={executive?.company || ''}
                  onChange={(e) => setExecutive(prev => prev ? {...prev, company: e.target.value} : null)}
                  className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-100/70 mb-2">Phone</label>
                <input
                  type="text"
                  value={executive?.profile?.phone || ''}
                  onChange={(e) => updateProfile('phone', e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-100/70 mb-2">Timezone</label>
                <select
                  value={executive?.profile?.timezone || 'America/Los_Angeles'}
                  onChange={(e) => updateProfile('timezone', e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                >
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Communication Preferences</h2>
              
              <div>
                <label className="block text-sm text-gray-100/70 mb-2">Communication Style</label>
                <select
                  value={executive?.profile?.communication?.style || 'direct'}
                  onChange={(e) => updateProfile('communication', {...executive?.profile?.communication, style: e.target.value})}
                  className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                >
                  <option value="direct">Direct</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="warm">Warm & Friendly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-100/70 mb-2">Preferred Sign-off</label>
                <input
                  type="text"
                  value={executive?.profile?.communication?.signoff || ''}
                  onChange={(e) => updateProfile('communication', {...executive?.profile?.communication, signoff: e.target.value})}
                  placeholder="Best, Thanks, Cheers"
                  className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-100/70 mb-2">Tone Notes</label>
                <textarea
                  value={executive?.profile?.communication?.tone || ''}
                  onChange={(e) => updateProfile('communication', {...executive?.profile?.communication, tone: e.target.value})}
                  placeholder="Professional but warm, avoid jargon..."
                  rows={3}
                  className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Calendar Preferences</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-100/70 mb-2">Default Meeting Length (min)</label>
                  <input
                    type="number"
                    value={executive?.profile?.calendar?.default_meeting_length || 30}
                    onChange={(e) => updateProfile('calendar', {...executive?.profile?.calendar, default_meeting_length: parseInt(e.target.value)})}
                    className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-100/70 mb-2">Buffer Time (min)</label>
                  <input
                    type="number"
                    value={executive?.profile?.calendar?.buffer_minutes || 5}
                    onChange={(e) => updateProfile('calendar', {...executive?.profile?.calendar, buffer_minutes: parseInt(e.target.value)})}
                    className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-100/70 mb-2">Earliest Meeting Time</label>
                  <input
                    type="time"
                    value={executive?.profile?.calendar?.earliest_meeting || '09:00'}
                    onChange={(e) => updateProfile('calendar', {...executive?.profile?.calendar, earliest_meeting: e.target.value})}
                    className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-100/70 mb-2">Latest Meeting Time</label>
                  <input
                    type="time"
                    value={executive?.profile?.calendar?.latest_meeting || '17:00'}
                    onChange={(e) => updateProfile('calendar', {...executive?.profile?.calendar, latest_meeting: e.target.value})}
                    className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'travel' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Travel Preferences</h2>
              
              <div>
                <label className="block text-sm text-gray-100/70 mb-2">Preferred Airline</label>
                <input
                  type="text"
                  value={executive?.profile?.travel?.airline_preference || ''}
                  onChange={(e) => updateProfile('travel', {...executive?.profile?.travel, airline_preference: e.target.value})}
                  placeholder="Delta, United, etc."
                  className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-100/70 mb-2">Seat Preference</label>
                <select
                  value={executive?.profile?.travel?.seat_preference || 'aisle'}
                  onChange={(e) => updateProfile('travel', {...executive?.profile?.travel, seat_preference: e.target.value})}
                  className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                >
                  <option value="aisle">Aisle</option>
                  <option value="window">Window</option>
                  <option value="middle">No Preference</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-100/70 mb-2">Preferred Hotel Chain</label>
                <input
                  type="text"
                  value={executive?.profile?.travel?.hotel_preference || ''}
                  onChange={(e) => updateProfile('travel', {...executive?.profile?.travel, hotel_preference: e.target.value})}
                  placeholder="Marriott, Hilton, etc."
                  className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'family' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Family Information</h2>
              <p className="text-gray-100/70 text-sm mb-4">
                This helps the EA schedule around family commitments and remember important dates.
              </p>
              
              <div>
                <label className="block text-sm text-gray-100/70 mb-2">Spouse/Partner Name</label>
                <input
                  type="text"
                  value={executive?.profile?.family?.spouse || ''}
                  onChange={(e) => updateProfile('family', {...executive?.profile?.family, spouse: e.target.value})}
                  className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-100/70 mb-2">Children (comma-separated)</label>
                <input
                  type="text"
                  value={executive?.profile?.family?.kids?.join(', ') || ''}
                  onChange={(e) => updateProfile('family', {...executive?.profile?.family, kids: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                  placeholder="Luke, Liam, Henry"
                  className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'vips' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">VIP List</h2>
              <p className="text-gray-100/70 text-sm mb-4">
                People who should always be prioritized. Messages from VIPs can trigger special handling rules.
              </p>
              
              <div>
                <label className="block text-sm text-gray-100/70 mb-2">VIP Email Addresses (one per line)</label>
                <textarea
                  value={executive?.profile?.vip_list?.join('\n') || ''}
                  onChange={(e) => updateProfile('vip_list', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                  placeholder="ceo@company.com&#10;board@company.com"
                  rows={5}
                  className="w-full bg-gray-900/50 border border-gray-500/30 rounded-lg px-4 py-2 focus:border-sonance-beam focus:outline-none"
                />
              </div>
              
              <Link href="/admin/vips" className="text-sonance-beam text-sm hover:underline">
                Manage full VIP contact list →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
