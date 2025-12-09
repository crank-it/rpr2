import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: activities, error, count } = await supabase
      .from('activities')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Failed to fetch activities:', error)
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      )
    }

    // Format activities for frontend
    const formattedActivities = (activities || []).map((activity) => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      entityType: activity.type?.includes('project') ? 'Project' :
                  activity.type?.includes('campaign') ? 'Campaign' :
                  activity.type?.includes('customer') ? 'Customer' :
                  activity.type?.includes('asset') ? 'Asset' : 'Activity',
      entityId: activity.project_id || activity.campaign_id || activity.customer_id || null,
      performedBy: activity.performed_by,
      createdAt: activity.created_at
    }))

    return NextResponse.json({
      activities: formattedActivities,
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Failed to fetch activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}
