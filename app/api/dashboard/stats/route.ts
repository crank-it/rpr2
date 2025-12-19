import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '15')

    // Parse filter parameters
    const activityType = searchParams.get('activityType') || 'all' // 'all' | 'project' | 'customer' | 'task' | 'comment'
    const dateRange = searchParams.get('dateRange') || 'all' // 'all' | 'today' | 'week' | 'month'
    const userId = searchParams.get('userId') || 'all'

    // Calculate date filter
    let dateFilter: Date | null = null
    const now = new Date()
    if (dateRange === 'today') {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (dateRange === 'week') {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (dateRange === 'month') {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let activities: any[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let comments: any[] = []

    // Fetch activities if needed (for 'all', 'project', 'customer', or 'task')
    if (activityType === 'all' || activityType === 'project' || activityType === 'customer' || activityType === 'task') {
      let activityQuery = supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })

      // Filter by entity type
      if (activityType === 'project') {
        // Project activities only (exclude task activities)
        activityQuery = activityQuery.not('project_id', 'is', null).not('type', 'like', 'task_%')
      } else if (activityType === 'customer') {
        activityQuery = activityQuery.not('customer_id', 'is', null)
      } else if (activityType === 'task') {
        // Task activities only (type starts with 'task_')
        activityQuery = activityQuery.like('type', 'task_%')
      }

      if (dateFilter) {
        activityQuery = activityQuery.gte('created_at', dateFilter.toISOString())
      }
      if (userId !== 'all') {
        activityQuery = activityQuery.eq('performed_by', userId)
      }

      const { data: activityData } = await activityQuery
      activities = activityData || []
    }

    // Fetch comments if needed (for 'all' or 'comment')
    if (activityType === 'all' || activityType === 'comment') {
      let commentQuery = supabase
        .from('comments')
        .select('*')
        .is('parent_id', null) // Only top-level comments
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (dateFilter) {
        commentQuery = commentQuery.gte('created_at', dateFilter.toISOString())
      }
      if (userId !== 'all') {
        commentQuery = commentQuery.eq('author_id', userId)
      }

      const { data: commentData } = await commentQuery
      comments = commentData || []
    }

    // Collect entity IDs by type
    const projectIds = [
      ...activities.filter(a => a.project_id).map(a => a.project_id),
      ...comments.filter(c => c.entity_type === 'PROJECT').map(c => c.entity_id)
    ]
    const customerIds = [
      ...comments.filter(c => c.entity_type === 'CUSTOMER').map(c => c.entity_id)
    ]

    // Collect user IDs from activities and comments (only Clerk IDs that start with "user_")
    const activityUserIds = activities
      .filter(a => a.performed_by && a.performed_by.startsWith('user_'))
      .map(a => a.performed_by)

    const commentAuthorIds = comments
      .filter(c => c.author_id && c.author_id.startsWith('user_'))
      .map(c => c.author_id)

    // Include the filtered userId to ensure we have their name for display
    const filteredUserId = userId !== 'all' && userId.startsWith('user_') ? [userId] : []

    const userIds = [...new Set([...activityUserIds, ...commentAuthorIds, ...filteredUserId])]

    // Fetch entity details and users
    const [projectsData, customersData, usersData] = await Promise.all([
      projectIds.length > 0
        ? supabase.from('projects').select('id, title, status').in('id', [...new Set(projectIds)])
        : { data: [] },
      customerIds.length > 0
        ? supabase.from('customers').select('id, name').in('id', [...new Set(customerIds)])
        : { data: [] },
      userIds.length > 0
        ? supabase.from('users').select('id, name, email').in('id', userIds)
        : { data: [] }
    ])

    // Create lookup maps
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectMap: Record<string, any> = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customerMap: Record<string, any> = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userMap: Record<string, any> = {}

    projectsData.data?.forEach(p => { projectMap[p.id] = p })
    customersData.data?.forEach(c => { customerMap[c.id] = c })
    usersData.data?.forEach(u => { userMap[u.id] = u })

    // Format activities
    const formattedActivities = activities.map((activity) => {
      let entityType = 'Activity'
      let entityName = activity.description || 'Activity'
      let entityId = null
      let linkHref = null
      let isEntityDeleted = false

      const actionType = activity.type || ''

      // Check if this is a task activity
      if (actionType.startsWith('task_')) {
        entityType = 'Task'
        // Extract task title from description (format: Task "Title" was ...)
        const titleMatch = activity.description?.match(/"([^"]+)"/)
        entityName = titleMatch ? titleMatch[1] : activity.description || 'Task'
        entityId = activity.project_id
        // Link to the project since tasks are viewed within projects
        if (activity.project_id) {
          const project = projectMap[activity.project_id]
          if (project) {
            linkHref = `/projects/${activity.project_id}`
          } else {
            isEntityDeleted = true
          }
        }
      } else if (activity.project_id) {
        const project = projectMap[activity.project_id]
        entityType = 'Project'
        entityId = activity.project_id
        if (project) {
          entityName = project.title
          linkHref = `/projects/${activity.project_id}`
        } else {
          entityName = activity.description || 'Deleted Project'
          isEntityDeleted = true
        }
      } else if (activity.customer_id) {
        const customer = customerMap[activity.customer_id]
        entityType = 'Customer'
        entityId = activity.customer_id
        if (customer) {
          entityName = customer.name
          linkHref = `/customers/${activity.customer_id}`
        } else {
          entityName = activity.description || 'Deleted Customer'
          isEntityDeleted = true
        }
      }

      // Get user name - performed_by may contain user ID or name directly
      let userName = null
      if (activity.performed_by) {
        // Check if it's a Clerk user ID (starts with "user_")
        if (activity.performed_by.startsWith('user_')) {
          const user = userMap[activity.performed_by]
          // Use name, email, or fallback to 'User' if both are empty
          userName = (user?.name && user.name.trim()) || (user?.email && user.email.trim()) || 'User'
        } else {
          // It's already a name
          userName = activity.performed_by
        }
      }

      // Parse action from activity type (e.g., "project_created" -> "created")
      let action = 'updated'
      if (actionType.includes('created')) action = 'created'
      else if (actionType.includes('deleted')) action = 'deleted'
      else if (actionType.includes('updated') || actionType.includes('edited')) action = 'edited'
      else if (actionType.includes('completed')) action = 'completed'
      else if (actionType.includes('assigned')) action = 'assigned'
      else if (actionType.includes('status')) action = 'status changed'

      return {
        id: `activity-${activity.id}`,
        activityType: 'activity',
        title: entityName,
        type: entityType,
        action: action,
        userName: userName,
        description: activity.description,
        time: getRelativeTime(new Date(activity.created_at)),
        timestamp: activity.created_at,
        entityId,
        linkHref,
        isEntityDeleted
      }
    })

    // Format comments
    const formattedComments = comments.map((comment) => {
      let entityType = 'Comment'
      let entityName = ''
      const entityId = comment.entity_id
      let linkHref = null
      let isEntityDeleted = false

      if (comment.entity_type === 'PROJECT') {
        const project = projectMap[comment.entity_id]
        entityType = 'Project Comment'
        if (project) {
          entityName = project.title
          linkHref = `/projects/${comment.entity_id}`
        } else {
          entityName = 'Deleted Project'
          isEntityDeleted = true
        }
      } else if (comment.entity_type === 'CUSTOMER') {
        const customer = customerMap[comment.entity_id]
        entityType = 'Customer Comment'
        if (customer) {
          entityName = customer.name
          linkHref = `/customers/${comment.entity_id}`
        } else {
          entityName = 'Deleted Customer'
          isEntityDeleted = true
        }
      }

      // Get author name - look up from author_id if it's a Clerk ID, otherwise use stored author
      let authorName = comment.author || 'User'
      if (comment.author_id && comment.author_id.startsWith('user_')) {
        const user = userMap[comment.author_id]
        if (user) {
          authorName = (user.name && user.name.trim()) || (user.email && user.email.trim()) || comment.author || 'User'
        }
      }

      return {
        id: `comment-${comment.id}`,
        activityType: 'comment',
        commentId: comment.id,
        title: `${authorName} commented on ${entityName}`,
        type: entityType,
        author: authorName,
        content: comment.content,
        time: getRelativeTime(new Date(comment.created_at)),
        timestamp: comment.created_at,
        entityId,
        entityType: comment.entity_type,
        linkHref,
        replyCount: 0, // Will be populated with replies
        isEntityDeleted
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

    // Calculate pagination
    const total = allActivity.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedActivity = allActivity.slice(offset, offset + limit)

    return NextResponse.json({
      recentActivity: paginatedActivity,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
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
