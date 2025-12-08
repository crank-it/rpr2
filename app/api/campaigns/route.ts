import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
      budget: campaign.budget,
      actualSpend: campaign.actual_spend,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
      _count: { assets: 0, activities: 0 }
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

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        name: body.name,
        description: body.description || null,
        audience: body.audience || 'BOTH',
        status: body.status || 'draft',
        launch_date: body.launchDate || null,
        end_date: body.endDate || null,
        budget: body.budget || null,
        actual_spend: body.actualSpend || null
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
      performed_by: 'System'
    })

    // Transform to camelCase
    const transformedCampaign = {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      audience: campaign.audience,
      status: campaign.status,
      launchDate: campaign.launch_date,
      endDate: campaign.end_date,
      budget: campaign.budget,
      actualSpend: campaign.actual_spend,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at
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
