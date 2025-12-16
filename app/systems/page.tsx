'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, CheckCircle, AlertCircle, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

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
  const [systems, setSystems] = useState<System[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    assignedToMe: false,
    needsAcknowledgement: false,
    search: ''
  })

  useEffect(() => {
    fetchSystems()
  }, [filters])

  const fetchSystems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filters.status) params.append('status', filters.status)
      if (filters.category) params.append('category', filters.category)
      if (filters.assignedToMe) params.append('assigned_to_me', 'true')
      if (filters.needsAcknowledgement) params.append('needs_acknowledgement', 'true')
      if (filters.search) params.append('search', filters.search)
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

  // Get unique categories for filter
  const categories = Array.from(new Set(systems.map(s => s.category)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Systems</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage business systems, SOPs, and processes
          </p>
        </div>
        <Link href="/systems/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New System
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search systems..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Start">Start</option>
            <option value="Approve">Approve</option>
            <option value="Need Review">Need Review</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Quick Filters */}
          <div className="flex gap-2">
            <Button
              variant={filters.assignedToMe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, assignedToMe: !filters.assignedToMe })}
              className="flex-1"
            >
              Assigned to me
            </Button>
            <Button
              variant={filters.needsAcknowledgement ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, needsAcknowledgement: !filters.needsAcknowledgement })}
              className="flex-1"
            >
              Needs ack
            </Button>
          </div>
        </div>
      </Card>

      {/* Systems List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-solid border-gray-900 border-r-transparent rounded-full" />
        </div>
      ) : systems.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No systems found</p>
          <Link href="/systems/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create your first system
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Title</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Version</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Assigned</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Pending</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Your Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {systems.map((system) => (
                <tr key={system.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <Link href={`/systems/${system.id}`} className="font-medium text-primary hover:underline">
                      {system.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">{system.category}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusColors[system.status] as any || 'secondary'}>
                      {system.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    v{system.version}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {system.assignedUserCount}
                  </td>
                  <td className="py-3 px-4">
                    {system.pendingAcknowledgements > 0 ? (
                      <span className="text-sm text-amber-600 font-medium">
                        {system.pendingAcknowledgements}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {getAcknowledgementBadge(system.userAcknowledgementStatus)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatDate(system.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
