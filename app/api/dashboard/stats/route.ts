import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get counts for all entities
    const [projectsResult, assetsResult, campaignsResult, customersResult] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('assets').select('id', { count: 'exact', head: true }),
      supabase.from('campaigns').select('id', { count: 'exact', head: true }),
      supabase.from('customers').select('id', { count: 'exact', head: true })
    ])

    const projectCount = projectsResult.count || 0
    const assetCount = assetsResult.count || 0
    const campaignCount = campaignsResult.count || 0
    const customerCount = customersResult.count || 0

    // Get project status counts
    const [activeResult, reviewResult, completedResult] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'IN_PROGRESS'),
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'REVIEW'),
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'COMPLETED')
    ])

    const activeProjects = activeResult.count || 0
    const reviewProjects = reviewResult.count || 0
    const completedProjects = completedResult.count || 0

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    // Get entity statuses for activities
    const activities = recentActivity || []

    // Collect entity IDs by type (activities use project_id, campaign_id, customer_id columns)
    const projectIds = activities.filter(a => a.project_id).map(a => a.project_id)
    const campaignIds = activities.filter(a => a.campaign_id).map(a => a.campaign_id)

    // Fetch statuses from related tables (customers don't have status)
    const [projectStatuses, campaignStatuses] = await Promise.all([
      projectIds.length > 0
        ? supabase.from('projects').select('id, status').in('id', projectIds)
        : { data: [] },
      campaignIds.length > 0
        ? supabase.from('campaigns').select('id, status').in('id', campaignIds)
        : { data: [] }
    ])

    // Create lookup maps for statuses
    const statusMap: Record<string, string> = {}
    projectStatuses.data?.forEach(p => { statusMap[`project-${p.id}`] = p.status })
    campaignStatuses.data?.forEach(c => { statusMap[`campaign-${c.id}`] = c.status })

    // Format activity for frontend
    const formattedActivity = activities.map((activity) => {
      // Determine entity type and get status
      let entityType = 'Activity'
      let entityStatus = ''

      if (activity.project_id) {
        entityType = 'Project'
        entityStatus = statusMap[`project-${activity.project_id}`] || ''
      } else if (activity.campaign_id) {
        entityType = 'Campaign'
        entityStatus = statusMap[`campaign-${activity.campaign_id}`] || ''
      } else if (activity.customer_id) {
        entityType = 'Customer'
        // Customers don't have status
      } else if (activity.asset_id) {
        entityType = 'Asset'
        // Assets don't have status
      }

      return {
        id: activity.id,
        title: activity.description || 'Activity',
        type: entityType,
        status: entityStatus,
        time: getRelativeTime(new Date(activity.created_at))
      }
    })

    return NextResponse.json({
      stats: {
        projects: projectCount,
        assets: assetCount,
        campaigns: campaignCount,
        customers: customerCount
      },
      projectStatus: {
        active: activeProjects,
        review: reviewProjects,
        completed: completedProjects
      },
      recentActivity: formattedActivity
    })
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return '1 day ago'
  return `${diffDays} days ago`
}
