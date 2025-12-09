import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch campaign with related assets and activities
    const [campaignResult, assetsResult, activitiesResult] = await Promise.all([
      supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single(),
      supabase
        .from('assets')
        .select('*')
        .eq('campaign_id', id),
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
      assets: assetsResult.data || [],
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

    // Log activity
    await supabase.from('activities').insert({
      type: 'campaign_updated',
      description: `Campaign "${campaign.name}" was updated`,
      campaign_id: campaign.id,
      performed_by: 'System'
    })

    // Fetch related assets and activities
    const [assetsResult, activitiesResult] = await Promise.all([
      supabase.from('assets').select('*').eq('campaign_id', id),
      supabase.from('activities').select('*').eq('campaign_id', id)
    ])

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
      assets: assetsResult.data || [],
      activities: activitiesResult.data || []
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
