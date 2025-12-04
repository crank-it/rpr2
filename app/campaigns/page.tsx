'use client'

import { Plus, Search, Filter, Calendar as CalendarIcon, Target, TrendingUp, Users, DollarSign, Pencil } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreateCampaignModal } from '@/components/campaigns/CreateCampaignModal'
import { formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
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
  launch_date: string | null
  end_date: string | null
  budget: number | null
  progress: number
  created_at: string
}

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaigns:', error)
    } else {
      setCampaigns(data || [])
    }
    setLoading(false)
  }

  const handleCampaignCreated = async (newCampaign: any) => {
    const { data, error } = await supabase
      .from('campaigns')
      .insert([{
        name: newCampaign.name,
        description: newCampaign.description || null,
        audience: newCampaign.audience || 'BOTH',
        status: newCampaign.status || 'DRAFT',
        launch_date: newCampaign.launch_date || null,
        end_date: newCampaign.end_date || null,
        budget: newCampaign.budget || null,
        progress: newCampaign.progress || 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating campaign:', error)
    } else if (data) {
      setCampaigns([data, ...campaigns])
    }
    setIsCreateModalOpen(false)
  }

  const handleCampaignUpdated = async (updatedCampaign: any) => {
    if (!editingCampaign) return

    const { data, error } = await supabase
      .from('campaigns')
      .update({
        name: updatedCampaign.name,
        description: updatedCampaign.description,
        audience: updatedCampaign.audience,
        status: updatedCampaign.status,
        launch_date: updatedCampaign.launch_date,
        end_date: updatedCampaign.end_date,
        budget: updatedCampaign.budget,
        progress: updatedCampaign.progress
      })
      .eq('id', editingCampaign.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating campaign:', error)
    } else if (data) {
      setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? data : c))
    }
    setEditingCampaign(null)
  }

  const handleEditClick = (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingCampaign(campaign)
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

  const getDaysUntilLaunch = (launchDate: string | null) => {
    if (!mounted || !launchDate) return '-'
    const days = Math.ceil((new Date(launchDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'Launched'
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    return `${days} days`
  }

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search campaigns..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={(e) => handleEditClick(campaign, e)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>

                    {campaign.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {campaign.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {campaign.launch_date && (
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Launch: {formatDate(campaign.launch_date)}</span>
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
                      {getDaysUntilLaunch(campaign.launch_date)}
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">to launch</div>
                  </div>
                </div>

                {/* Progress Bar */}
                {campaign.progress > 0 && (
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
          <CardContent className="p-12">
            <div className="text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mx-auto mb-4">
                <CalendarIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Calendar view coming soon</h3>
              <p className="text-sm text-muted-foreground">
                Visual timeline of all campaigns with phase coordination
              </p>
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
    </div>
  )
}
