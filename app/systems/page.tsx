'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, CheckCircle, AlertCircle, RotateCw } from 'lucide-react'

interface System {
  id: string
  title: string
  category: string
  status: string
  description: string | null
  version: number
  createdBy: string
  createdAt: string
  updatedBy: string | null
  updatedAt: string | null
  assignedUserCount: number
  pendingAcknowledgements: number
  userAcknowledgementStatus: 'acknowledged' | 'needs_acknowledgement' | 'update_required' | null
}

const statusColors: Record<string, string> = {
  'Draft': 'secondary',
  'Start': 'outline',
  'Approve': 'default',
  'Need Review': 'destructive'
}

export default function SystemsPage() {
  const router = useRouter()
  const [systems, setSystems] = useState<System[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchSystems()
  }, [])

  const fetchSystems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('sort', '-updated_at')

      const response = await fetch(`/api/systems?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSystems(data)
      }
    } catch (error) {
      console.error('Failed to fetch systems:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSystems = systems.filter(system => {
    const matchesSearch = system.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const getAcknowledgementBadge = (status: System['userAcknowledgementStatus']) => {
    if (!status) return null

    switch (status) {
      case 'acknowledged':
        return (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs">Acknowledged</span>
          </div>
        )
      case 'needs_acknowledgement':
        return (
          <div className="flex items-center gap-1 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">Needs acknowledgement</span>
          </div>
        )
      case 'update_required':
        return (
          <div className="flex items-center gap-1 text-red-600">
            <RotateCw className="h-4 w-4" />
            <span className="text-xs">Update required</span>
          </div>
        )
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Centered container with max width */}
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* Header - Centered */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-normal text-foreground tracking-tight mb-3">
            Systems
          </h1>
          <p className="text-sm text-muted-foreground">
            {filteredSystems.length} {filteredSystems.length === 1 ? 'system' : 'systems'}
          </p>
        </div>

        {/* Search bar - Minimal */}
        <div className="relative mb-16">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            className="w-full border-0 border-b border-border bg-transparent py-3 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Systems List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-foreground border-r-transparent"></div>
          </div>
        ) : filteredSystems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-8">
              {searchQuery ? 'No systems found' : 'No systems yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/systems/new')}
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create your first system
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            {filteredSystems.map((system, index) => (
              <div key={system.id}>
                <Link
                  href={`/systems/${system.id}`}
                  className="block py-8 transition-opacity hover:opacity-60"
                >
                  <div className="flex items-baseline justify-between gap-8">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-foreground mb-1">
                        {system.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{system.category}</span>
                        <span>·</span>
                        <span>{system.status}</span>
                        <span>·</span>
                        <span>v{system.version}</span>
                        {system.userAcknowledgementStatus === 'needs_acknowledgement' && (
                          <>
                            <span>·</span>
                            <span className="text-amber-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Needs acknowledgement
                            </span>
                          </>
                        )}
                        {system.userAcknowledgementStatus === 'update_required' && (
                          <>
                            <span>·</span>
                            <span className="text-red-600 flex items-center gap-1">
                              <RotateCw className="h-3 w-3" />
                              Update required
                            </span>
                          </>
                        )}
                        {system.userAcknowledgementStatus === 'acknowledged' && (
                          <>
                            <span>·</span>
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Acknowledged
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
                {index < filteredSystems.length - 1 && (
                  <div className="h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Floating action button - bottom right */}
        <button
          onClick={() => router.push('/systems/new')}
          className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft-lg hover:shadow-soft-xl transition-all hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
