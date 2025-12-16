import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get recent activities from activities table
    const { data: recentActivity } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    // Get recent comments (all entity types)
    const { data: recentComments } = await supabase
      .from('comments')
      .select('*')
      .is('parent_id', null) // Only top-level comments
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20)

    const activities = recentActivity || []
    const comments = recentComments || []

    // Collect entity IDs by type
    const projectIds = [
      ...activities.filter(a => a.project_id).map(a => a.project_id),
      ...comments.filter(c => c.entity_type === 'PROJECT').map(c => c.entity_id)
    ]
    const campaignIds = [
      ...activities.filter(a => a.campaign_id).map(a => a.campaign_id),
      ...comments.filter(c => c.entity_type === 'CAMPAIGN').map(c => c.entity_id)
    ]
    const customerIds = [
      ...comments.filter(c => c.entity_type === 'CUSTOMER').map(c => c.entity_id)
    ]

    // Fetch entity details
    const [projectsData, campaignsData, customersData] = await Promise.all([
      projectIds.length > 0
        ? supabase.from('projects').select('id, title, status').in('id', projectIds)
        : { data: [] },
      campaignIds.length > 0
        ? supabase.from('campaigns').select('id, name, status').in('id', campaignIds)
        : { data: [] },
      customerIds.length > 0
        ? supabase.from('customers').select('id, name').in('id', customerIds)
        : { data: [] }
    ])

    // Create lookup maps
    const projectMap: Record<string, any> = {}
    const campaignMap: Record<string, any> = {}
    const customerMap: Record<string, any> = {}

    projectsData.data?.forEach(p => { projectMap[p.id] = p })
    campaignsData.data?.forEach(c => { campaignMap[c.id] = c })
    customersData.data?.forEach(c => { customerMap[c.id] = c })

    // Format activities
    const formattedActivities = activities.map((activity) => {
      let entityType = 'Activity'
      let entityName = activity.description || 'Activity'
      let entityId = null
      let linkHref = null

      if (activity.project_id) {
        const project = projectMap[activity.project_id]
        entityType = 'Project'
        entityName = project?.title || activity.description
        entityId = activity.project_id
        linkHref = `/projects/${activity.project_id}`
      } else if (activity.campaign_id) {
        const campaign = campaignMap[activity.campaign_id]
        entityType = 'Campaign'
        entityName = campaign?.name || activity.description
        entityId = activity.campaign_id
        linkHref = `/campaigns/${activity.campaign_id}`
      } else if (activity.customer_id) {
        const customer = customerMap[activity.customer_id]
        entityType = 'Customer'
        entityName = customer?.name || activity.description
        entityId = activity.customer_id
        linkHref = `/customers/${activity.customer_id}`
      }

      return {
        id: `activity-${activity.id}`,
        activityType: 'activity',
        title: entityName,
        type: entityType,
        description: activity.description,
        time: getRelativeTime(new Date(activity.created_at)),
        timestamp: activity.created_at,
        entityId,
        linkHref
      }
    })

    // Format comments
    const formattedComments = comments.map((comment) => {
      let entityType = 'Comment'
      let entityName = ''
      let entityId = comment.entity_id
      let linkHref = null

      if (comment.entity_type === 'PROJECT') {
        const project = projectMap[comment.entity_id]
        entityType = 'Project Comment'
        entityName = project?.title || 'Project'
        linkHref = `/projects/${comment.entity_id}`
      } else if (comment.entity_type === 'CAMPAIGN') {
        const campaign = campaignMap[comment.entity_id]
        entityType = 'Campaign Comment'
        entityName = campaign?.name || 'Campaign'
        linkHref = `/campaigns/${comment.entity_id}`
      } else if (comment.entity_type === 'CUSTOMER') {
        const customer = customerMap[comment.entity_id]
        entityType = 'Customer Comment'
        entityName = customer?.name || 'Customer'
        linkHref = `/customers/${comment.entity_id}`
      }

      return {
        id: `comment-${comment.id}`,
        activityType: 'comment',
        commentId: comment.id,
        title: `${comment.author} commented on ${entityName}`,
        type: entityType,
        author: comment.author,
        content: comment.content,
        time: getRelativeTime(new Date(comment.created_at)),
        timestamp: comment.created_at,
        entityId,
        entityType: comment.entity_type,
        linkHref,
        replyCount: 0 // Will be populated with replies
      }
    })

    // Fetch reply counts for comments
    const commentIds = comments.map(c => c.id)
    if (commentIds.length > 0) {
      const { data: repliesData } = await supabase
        .from('comments')
        .select('parent_id')
        .in('parent_id', commentIds)
        .is('deleted_at', null)

      // Count replies per comment
      const replyCounts: Record<string, number> = {}
      repliesData?.forEach(reply => {
        replyCounts[reply.parent_id] = (replyCounts[reply.parent_id] || 0) + 1
      })

      // Update reply counts
      formattedComments.forEach(comment => {
        const commentId = comment.commentId
        comment.replyCount = replyCounts[commentId] || 0
      })
    }

    // Combine and sort by timestamp
    const allActivity = [...formattedActivities, ...formattedComments]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20) // Keep top 20

    return NextResponse.json({
      recentActivity: allActivity
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
