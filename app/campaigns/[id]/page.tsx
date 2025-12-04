'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Target, DollarSign, Users, FileText, Activity, Pencil, TrendingUp } from 'lucide-react'
import { CommentThread } from '@/components/comments/CommentThread'
import { CreateCampaignModal } from '@/components/campaigns/CreateCampaignModal'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'

const DEMO_CAMPAIGNS = [
  {
    id: '1',
    name: 'Summer Color Collection Launch 2024',
    description: 'Launch our premium summer color range across all channels with coordinated B2B and B2C messaging',
    audience: 'BOTH',
    status: 'active',
    launchDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    distributorPreviewDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
    salonLaunchDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    consumerLaunchDate: new Date(Date.now()).toISOString(),
    budget: 45000,
    goals: ['Brand Awareness', 'Sales Growth', 'Salon Education'],
    _count: { assets: 24, activities: 156 }
  },
  {
    id: '2',
    name: 'VIP Salon Partner Program',
    description: 'Exclusive campaign for our top-tier salon partners with premium training and early access',
    audience: 'B2B',
    status: 'planning',
    launchDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: null,
    distributorPreviewDate: null,
    salonLaunchDate: null,
    consumerLaunchDate: null,
    budget: 25000,
    goals: ['Partner Loyalty', 'Premium Positioning'],
    _count: { assets: 12, activities: 45 }
  },
  {
    id: '3',
    name: 'Instagram Influencer Collaboration',
    description: 'Partner with luxury lifestyle influencers to showcase our premium formulations',
    audience: 'B2C',
    status: 'active',
    launchDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 46 * 24 * 60 * 60 * 1000).toISOString(),
    distributorPreviewDate: null,
    salonLaunchDate: null,
    consumerLaunchDate: null,
    budget: 35000,
    goals: ['Social Engagement', 'Brand Awareness', 'UGC Generation'],
    _count: { assets: 67, activities: 234 }
  },
  {
    id: '4',
    name: 'Holiday Gift Sets 2024',
    description: 'Premium holiday collection with exclusive packaging for salon retail and direct consumer sales',
    audience: 'BOTH',
    status: 'draft',
    launchDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    distributorPreviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    salonLaunchDate: new Date(Date.now() + 106 * 24 * 60 * 60 * 1000).toISOString(),
    consumerLaunchDate: new Date(Date.now() + 113 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 75000,
    goals: ['Holiday Sales', 'Gift Purchases', 'Premium Positioning'],
    _count: { assets: 8, activities: 12 }
  }
]

const getStatusVariant = (status: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
    'draft': 'secondary',
    'planning': 'warning',
    'active': 'default',
    'completed': 'success'
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

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string
  const campaign = DEMO_CAMPAIGNS.find(c => c.id === campaignId) || DEMO_CAMPAIGNS[0]
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [progress, setProgress] = useState(45) // Default progress percentage

  const handleCampaignUpdated = (updatedCampaign: any) => {
    // Update progress if it's included in the campaign data
    if (updatedCampaign.progress !== undefined) {
      setProgress(updatedCampaign.progress)
    }
    console.log('Campaign updated:', updatedCampaign)
    setIsEditModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/campaigns"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">{campaign.name}</h1>
            <p className="text-muted-foreground max-w-3xl">
              {campaign.description}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={getStatusVariant(campaign.status)}>
              {campaign.status}
            </Badge>
            <Badge variant={getAudienceBadgeVariant(campaign.audience)}>
              {campaign.audience}
            </Badge>
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Campaign Goals */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Campaign Goals
            </CardTitle>
            <CardDescription>Key objectives for this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {campaign.goals.map((goal) => (
                <Badge
                  key={goal}
                  variant="secondary"
                  className="px-4 py-2 text-sm"
                >
                  {goal}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Audience
              </p>
              <p className="text-sm font-medium">{campaign.audience}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Launch Date
              </p>
              <p className="text-sm font-medium">{formatDate(campaign.launchDate)}</p>
            </div>
            <Separator />
            {campaign.endDate && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">End Date</p>
                  <p className="text-sm font-medium">{formatDate(campaign.endDate)}</p>
                </div>
                <Separator />
              </>
            )}
            {campaign.budget && (
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Budget
                </p>
                <p className="text-sm font-medium text-gray-900">
                  ${campaign.budget.toLocaleString()} AUD
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaign Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Campaign Progress
          </CardTitle>
          <CardDescription>Track completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-semibold text-gray-900">{progress}%</span>
              <span className="text-sm text-muted-foreground">
                {progress < 25 && 'Just getting started'}
                {progress >= 25 && progress < 50 && 'Making progress'}
                {progress >= 50 && progress < 75 && 'Halfway there'}
                {progress >= 75 && progress < 100 && 'Almost done'}
                {progress === 100 && 'Complete!'}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use the "Edit" button above to update campaign progress
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Launch Timeline */}
      {campaign.audience === 'BOTH' && (
        <Card>
          <CardHeader>
            <CardTitle>Launch Timeline</CardTitle>
            <CardDescription>Phased rollout across different audiences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaign.distributorPreviewDate && (
                <div className="flex items-center gap-4">
                  <div className="w-40 text-sm font-medium text-gray-900">Distributor Preview</div>
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(campaign.distributorPreviewDate)}
                  </div>
                </div>
              )}
              {campaign.salonLaunchDate && (
                <div className="flex items-center gap-4">
                  <div className="w-40 text-sm font-medium text-gray-900">Salon Launch</div>
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(campaign.salonLaunchDate)}
                  </div>
                </div>
              )}
              {campaign.consumerLaunchDate && (
                <div className="flex items-center gap-4">
                  <div className="w-40 text-sm font-medium text-gray-900">Consumer Launch</div>
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(campaign.consumerLaunchDate)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{campaign._count.assets}</div>
            <p className="text-xs text-muted-foreground mt-1">Marketing materials</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-400" />
              Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{campaign._count.activities}</div>
            <p className="text-xs text-muted-foreground mt-1">Campaign actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Communication */}
      <div>
        <CommentThread entityType="CAMPAIGN" entityId={campaign.id} />
      </div>

      <CreateCampaignModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onCampaignCreated={handleCampaignUpdated}
        initialData={{ ...campaign, progress }}
        isEditing={true}
      />
    </div>
  )
}
