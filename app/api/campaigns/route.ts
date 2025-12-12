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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const audience = searchParams.get('audience')

    let query = supabase
      .from('campaigns')
      .select('*')
      .order('launch_date', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }
    if (audience) {
      query = query.eq('audience', audience)
    }

    const { data: campaigns, error } = await query

    if (error) {
      console.error('Failed to fetch campaigns:', error)
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      )
    }

    // Transform to camelCase for frontend
    const transformedCampaigns = campaigns.map(campaign => ({
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
      progress: typeof campaign.progress === 'number' ? campaign.progress : 0,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
      assets: campaign.assets || [],
      _count: { assets: campaign.assets?.length || 0, activities: 0 }
    }))

    return NextResponse.json(transformedCampaigns)
  } catch (error) {
    console.error('Failed to fetch campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const performedBy = await getCurrentUserName()

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        name: body.name,
        description: body.description || null,
        audience: body.audience || 'BOTH',
        status: body.status || 'draft',
        launch_date: body.launchDate || null,
        end_date: body.endDate || null,
        distributor_preview_date: body.distributorPreviewDate || null,
        salon_launch_date: body.salonLaunchDate || null,
        consumer_launch_date: body.consumerLaunchDate || null,
        budget: body.budget || null,
        actual_spend: body.actualSpend || null,
        goals: body.goals || [],
        progress: body.progress !== undefined ? body.progress : 0,
        assets: body.assetIds || []
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create campaign:', error)
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('activities').insert({
      type: 'campaign_created',
      description: `Campaign "${campaign.name}" was created`,
      campaign_id: campaign.id,
      performed_by: performedBy
    })

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
      progress: campaign.progress || 0,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
      assets: assets,
      _count: { assets: assets.length, activities: 0 }
    }

    return NextResponse.json(transformedCampaign)
  } catch (error) {
    console.error('Failed to create campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
