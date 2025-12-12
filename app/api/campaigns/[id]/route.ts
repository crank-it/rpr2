import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { currentUser } from '@clerk/nextjs/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getCurrentUserName() {
  try {
    const user = await currentUser()
    if (user) {
      // Get user details from users table
      const { data: userData } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', user.id)
        .single()
      return userData?.name || userData?.email || user.emailAddresses?.[0]?.emailAddress || 'System'
    }
    return 'System'
  } catch {
    return 'System'
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch campaign and activities
    const [campaignResult, activitiesResult] = await Promise.all([
      supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single(),
      supabase
        .from('activities')
        .select('*')
        .eq('campaign_id', id)
    ])

    if (campaignResult.error || !campaignResult.data) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const campaign = campaignResult.data

    // Fetch full asset details if campaign has assets
    let assets: unknown[] = []
    if (campaign.assets && campaign.assets.length > 0) {
      const { data: assetData } = await supabase
        .from('assets')
        .select('*')
        .in('id', campaign.assets)
      assets = assetData || []
    }

    // Transform to camelCase
    const transformedCampaign = {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      audience: campaign.audience,
      status: campaign.status,
      launchDate: campaign.launch_date,
      endDate: campaign.end_date,
      distributorPreviewDate: campaign.distributor_preview_date,
      salonLaunchDate: campaign.salon_launch_date,
      consumerLaunchDate: campaign.consumer_launch_date,
      budget: campaign.budget,
      actualSpend: campaign.actual_spend,
      goals: campaign.goals || [],
      channels: campaign.channels || [],
      progress: campaign.progress || null,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
      assets: assets,
      activities: activitiesResult.data || []
    }

    return NextResponse.json(transformedCampaign)
  } catch (error) {
    console.error('Failed to fetch campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const performedBy = await getCurrentUserName()

    // Fetch existing campaign to compare changes
    const { data: existingCampaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.audience !== undefined) updateData.audience = body.audience
    if (body.status !== undefined) updateData.status = body.status
    if (body.launchDate !== undefined) updateData.launch_date = body.launchDate
    if (body.endDate !== undefined) updateData.end_date = body.endDate
    if (body.distributorPreviewDate !== undefined) updateData.distributor_preview_date = body.distributorPreviewDate
    if (body.salonLaunchDate !== undefined) updateData.salon_launch_date = body.salonLaunchDate
    if (body.consumerLaunchDate !== undefined) updateData.consumer_launch_date = body.consumerLaunchDate
    if (body.budget !== undefined) updateData.budget = body.budget
    if (body.actualSpend !== undefined) updateData.actual_spend = body.actualSpend
    if (body.goals !== undefined) updateData.goals = body.goals
    if (body.channels !== undefined) updateData.channels = body.channels
    if (body.progress !== undefined) updateData.progress = body.progress
    if (body.assetIds !== undefined) updateData.assets = body.assetIds

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update campaign:', error.message, error.details, error.hint)
      return NextResponse.json(
        { error: 'Failed to update campaign', details: error.message },
        { status: 500 }
      )
    }

    // Helper to normalize values for comparison (handles null, undefined, empty string, and dates)
    const normalize = (val: unknown): string => {
      if (val === null || val === undefined || val === '') return ''
      if (typeof val === 'string' && val.includes('T')) {
        // Normalize date strings to YYYY-MM-DD format
        return val.split('T')[0]
      }
      return String(val)
    }

    // Log detailed activities for each changed field
    const activities: { type: string; description: string; campaign_id: string; performed_by: string }[] = []
    const campaignName = campaign.name

    if (existingCampaign) {
      if (body.status !== undefined && normalize(body.status) !== normalize(existingCampaign.status)) {
        activities.push({
          type: 'campaign_updated',
          description: `Campaign "${campaignName}" updated status`,
          campaign_id: campaign.id,
          performed_by: performedBy
        })
      }
      if (body.name !== undefined && normalize(body.name) !== normalize(existingCampaign.name)) {
        activities.push({
          type: 'campaign_updated',
          description: `Campaign "${campaignName}" updated name`,
          campaign_id: campaign.id,
          performed_by: performedBy
        })
      }
      if (body.description !== undefined && normalize(body.description) !== normalize(existingCampaign.description)) {
        activities.push({
          type: 'campaign_updated',
          description: `Campaign "${campaignName}" updated description`,
          campaign_id: campaign.id,
          performed_by: performedBy
        })
      }
      if (body.launchDate !== undefined && normalize(body.launchDate) !== normalize(existingCampaign.launch_date)) {
        activities.push({
          type: 'campaign_updated',
          description: `Campaign "${campaignName}" updated launch date`,
          campaign_id: campaign.id,
          performed_by: performedBy
        })
      }
      if (body.endDate !== undefined && normalize(body.endDate) !== normalize(existingCampaign.end_date)) {
        activities.push({
          type: 'campaign_updated',
          description: `Campaign "${campaignName}" updated end date`,
          campaign_id: campaign.id,
          performed_by: performedBy
        })
      }
      if (body.budget !== undefined && normalize(body.budget) !== normalize(existingCampaign.budget)) {
        activities.push({
          type: 'campaign_updated',
          description: `Campaign "${campaignName}" updated budget`,
          campaign_id: campaign.id,
          performed_by: performedBy
        })
      }
      if (body.goals !== undefined && JSON.stringify(body.goals) !== JSON.stringify(existingCampaign.goals)) {
        activities.push({
          type: 'campaign_updated',
          description: `Campaign "${campaignName}" updated campaign goals`,
          campaign_id: campaign.id,
          performed_by: performedBy
        })
      }
      if (body.audience !== undefined && normalize(body.audience) !== normalize(existingCampaign.audience)) {
        activities.push({
          type: 'campaign_updated',
          description: `Campaign "${campaignName}" updated audience`,
          campaign_id: campaign.id,
          performed_by: performedBy
        })
      }
      if (body.channels !== undefined && JSON.stringify(body.channels) !== JSON.stringify(existingCampaign.channels)) {
        activities.push({
          type: 'campaign_updated',
          description: `Campaign "${campaignName}" updated channels`,
          campaign_id: campaign.id,
          performed_by: performedBy
        })
      }
      if (body.assetIds !== undefined && JSON.stringify(body.assetIds) !== JSON.stringify(existingCampaign.assets)) {
        activities.push({
          type: 'campaign_updated',
          description: `Campaign "${campaignName}" updated assets`,
          campaign_id: campaign.id,
          performed_by: performedBy
        })
      }
    }

    // Only insert activities if there were actual changes
    if (activities.length > 0) {
      await supabase.from('activities').insert(activities)
    }

    // Fetch full asset details if campaign has assets
    let assets: unknown[] = []
    if (campaign.assets && campaign.assets.length > 0) {
      const { data: assetData } = await supabase
        .from('assets')
        .select('*')
        .in('id', campaign.assets)
      assets = assetData || []
    }

    // Fetch activities
    const { data: activitiesData } = await supabase
      .from('activities')
      .select('*')
      .eq('campaign_id', id)

    // Transform to camelCase with all fields
    const transformedCampaign = {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      audience: campaign.audience,
      status: campaign.status,
      launchDate: campaign.launch_date,
      endDate: campaign.end_date,
      distributorPreviewDate: campaign.distributor_preview_date,
      salonLaunchDate: campaign.salon_launch_date,
      consumerLaunchDate: campaign.consumer_launch_date,
      budget: campaign.budget,
      actualSpend: campaign.actual_spend,
      goals: campaign.goals || [],
      channels: campaign.channels || [],
      progress: campaign.progress || null,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
      assets: assets,
      activities: activitiesData || []
    }

    return NextResponse.json(transformedCampaign)
  } catch (error) {
    console.error('Failed to update campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete campaign:', error)
      return NextResponse.json(
        { error: 'Failed to delete campaign' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
