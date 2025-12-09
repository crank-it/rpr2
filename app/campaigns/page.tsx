'use client'

import { Plus, Search, Filter, Calendar as CalendarIcon, Target, TrendingUp, Users, DollarSign, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CreateCampaignModal } from '@/components/campaigns/CreateCampaignModal'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

interface Campaign {
  id: string
  name: string
  description: string | null
  audience: string
  status: string
  launchDate: string | null
  endDate: string | null
  budget: number | null
  progress?: number
  createdAt: string
}

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [deleteCampaign, setDeleteCampaign] = useState<Campaign | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [mounted, setMounted] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [audienceFilter, setAudienceFilter] = useState<string>('')
  const filterRef = useRef<HTMLDivElement>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    fetchCampaigns()
  }, [])

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/campaigns')
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }
      const data = await response.json()
      setCampaigns(data)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    }
    setLoading(false)
  }

  const handleCampaignCreated = async (newCampaign: any) => {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCampaign.name,
          description: newCampaign.description || null,
          audience: newCampaign.audience || 'BOTH',
          status: newCampaign.status || 'DRAFT',
          launchDate: newCampaign.launchDate || newCampaign.launch_date || null,
          endDate: newCampaign.endDate || newCampaign.end_date || null,
          budget: newCampaign.budget || null
        })
      })
      if (!response.ok) {
        throw new Error('Failed to create campaign')
      }
      const data = await response.json()
      setCampaigns([data, ...campaigns])
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
    setIsCreateModalOpen(false)
  }

  const handleCampaignUpdated = async (updatedCampaign: any) => {
    if (!editingCampaign) return

    try {
      const response = await fetch(`/api/campaigns/${editingCampaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedCampaign.name,
          description: updatedCampaign.description,
          audience: updatedCampaign.audience,
          status: updatedCampaign.status,
          launchDate: updatedCampaign.launchDate || updatedCampaign.launch_date,
          endDate: updatedCampaign.endDate || updatedCampaign.end_date,
          budget: updatedCampaign.budget
        })
      })
      if (!response.ok) {
        throw new Error('Failed to update campaign')
      }
      const data = await response.json()
      setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? data : c))
    } catch (error) {
      console.error('Error updating campaign:', error)
    }
    setEditingCampaign(null)
  }

  const handleEditClick = (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingCampaign(campaign)
  }

  const handleDeleteClick = (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteCampaign(campaign)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteCampaign) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/campaigns/${deleteCampaign.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error('Failed to delete campaign')
      }
      setCampaigns(campaigns.filter(c => c.id !== deleteCampaign.id))
    } catch (error) {
      console.error('Error deleting campaign:', error)
    } finally {
      setIsDeleting(false)
      setDeleteCampaign(null)
    }
  }

  const getStatusVariant = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
      'DRAFT': 'secondary',
      'SCHEDULED': 'warning',
      'ACTIVE': 'default',
      'COMPLETED': 'success',
      'PAUSED': 'secondary'
    }
    return variants[status] || 'secondary'
  }

  const getAudienceBadgeVariant = (audience: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'warning'> = {
      'B2B': 'default',
      'B2C': 'warning',
      'BOTH': 'secondary'
    }
    return variants[audience] || 'secondary'
  }

  const getDaysUntilLaunch = (date: string | null) => {
    if (!mounted || !date) return '-'
    const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'Launched'
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    return `${days} days`
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || campaign.status.toUpperCase() === statusFilter.toUpperCase()
    const matchesAudience = !audienceFilter || campaign.audience.toUpperCase() === audienceFilter.toUpperCase()
    return matchesSearch && matchesStatus && matchesAudience
  })

  const clearFilters = () => {
    setStatusFilter('')
    setAudienceFilter('')
  }

  const activeFiltersCount = (statusFilter ? 1 : 0) + (audienceFilter ? 1 : 0)

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getCampaignsForDate = (day: number) => {
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    dateToCheck.setHours(0, 0, 0, 0)

    return filteredCampaigns.filter(campaign => {
      if (!campaign.launchDate) return false

      const launchDate = new Date(campaign.launchDate)
      launchDate.setHours(0, 0, 0, 0)

      const endDate = campaign.endDate ? new Date(campaign.endDate) : launchDate
      endDate.setHours(0, 0, 0, 0)

      return dateToCheck >= launchDate && dateToCheck <= endDate
    })
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'DRAFT': 'bg-gray-200 text-gray-700',
      'draft': 'bg-gray-200 text-gray-700',
      'SCHEDULED': 'bg-amber-100 text-amber-700',
      'scheduled': 'bg-amber-100 text-amber-700',
      'ACTIVE': 'bg-green-100 text-green-700',
      'active': 'bg-green-100 text-green-700',
      'COMPLETED': 'bg-blue-100 text-blue-700',
      'completed': 'bg-blue-100 text-blue-700',
      'PAUSED': 'bg-orange-100 text-orange-700',
      'paused': 'bg-orange-100 text-orange-700',
      'planning': 'bg-purple-100 text-purple-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-2">
            Plan and coordinate marketing campaigns
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white border border-gray-200 rounded-md p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendar
            </button>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search campaigns..."
              className="!pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative" ref={filterRef}>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-lg border bg-white shadow-lg p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">All Statuses</option>
                      <option value="DRAFT">Draft</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="ACTIVE">Active</option>
                      <option value="PAUSED">Paused</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Audience</label>
                    <select
                      value={audienceFilter}
                      onChange={(e) => setAudienceFilter(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">All Audiences</option>
                      <option value="B2B">B2B</option>
                      <option value="B2C">B2C</option>
                      <option value="BOTH">Both</option>
                    </select>
                  </div>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Campaigns Content */}
      {loading ? (
        <Card className="p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading campaigns...</p>
        </Card>
      ) : filteredCampaigns.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
              <CalendarIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No campaigns found' : 'No campaigns yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {searchQuery ? 'Try a different search term' : 'Create your first marketing campaign to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            )}
          </div>
        </Card>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="cursor-pointer card-hover"
              onClick={() => router.push(`/campaigns/${campaign.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {campaign.name}
                      </h3>
                      <Badge variant={getStatusVariant(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <Badge variant={getAudienceBadgeVariant(campaign.audience)}>
                        {campaign.audience}
                      </Badge>
                      <div className="ml-auto flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEditClick(campaign, e)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteClick(campaign, e)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {campaign.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {campaign.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {campaign.launchDate && (
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Launch: {formatDate(campaign.launchDate)}</span>
                        </div>
                      )}
                      {campaign.budget && (
                        <div className="flex items-center gap-1.5 text-gray-900 font-medium">
                          <DollarSign className="h-4 w-4" />
                          <span>${campaign.budget.toLocaleString()} AUD</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-6 text-right">
                    <div className="text-2xl font-semibold mb-1">
                      {getDaysUntilLaunch(campaign.launchDate)}
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">to launch</div>
                  </div>
                </div>

                {/* Progress Bar */}
                {campaign.progress && campaign.progress > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Campaign Progress</span>
                        <span>{campaign.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${campaign.progress}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="border rounded-lg overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 bg-gray-50 border-b">
                {dayNames.map((day) => (
                  <div key={day} className="py-3 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {/* Empty cells for days before the first of the month */}
                {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, index) => (
                  <div key={`empty-${index}`} className="min-h-[120px] p-2 border-b border-r bg-gray-50/50" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: getDaysInMonth(currentDate) }).map((_, index) => {
                  const day = index + 1
                  const campaignsForDay = getCampaignsForDate(day)
                  const todayClass = isToday(day) ? 'bg-blue-50' : ''

                  return (
                    <div
                      key={day}
                      className={`min-h-[120px] p-2 border-b border-r ${todayClass}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-blue-600' : 'text-gray-700'}`}>
                        {isToday(day) ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white">
                            {day}
                          </span>
                        ) : (
                          day
                        )}
                      </div>
                      <div className="space-y-1">
                        {campaignsForDay.slice(0, 3).map((campaign) => (
                          <div
                            key={campaign.id}
                            onClick={() => router.push(`/campaigns/${campaign.id}`)}
                            className={`text-xs px-2 py-1 rounded cursor-pointer truncate hover:opacity-80 transition-opacity ${getStatusColor(campaign.status)}`}
                            title={campaign.name}
                          >
                            {campaign.name}
                          </div>
                        ))}
                        {campaignsForDay.length > 3 && (
                          <div className="text-xs text-gray-500 px-2">
                            +{campaignsForDay.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Empty cells for remaining grid spaces */}
                {Array.from({
                  length: (7 - ((getFirstDayOfMonth(currentDate) + getDaysInMonth(currentDate)) % 7)) % 7
                }).map((_, index) => (
                  <div key={`empty-end-${index}`} className="min-h-[120px] p-2 border-b border-r bg-gray-50/50" />
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-200"></div>
                <span>Draft</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-100"></div>
                <span>Planning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-100"></div>
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-100"></div>
                <span>Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-100"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-100"></div>
                <span>Paused</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCampaignCreated={handleCampaignCreated}
      />

      {editingCampaign && (
        <CreateCampaignModal
          isOpen={!!editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onCampaignCreated={handleCampaignUpdated}
          initialData={editingCampaign}
          isEditing={true}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteCampaign(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Delete Campaign</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-medium">&quot;{deleteCampaign.name}&quot;</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteCampaign(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
