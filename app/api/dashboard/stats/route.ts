import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get counts for all entities
    const [projectCount, assetCount, campaignCount, customerCount] = await Promise.all([
      prisma.project.count(),
      prisma.asset.count(),
      prisma.campaign.count(),
      prisma.customer.count()
    ])

    // Get project status counts
    const [activeProjects, reviewProjects, completedProjects] = await Promise.all([
      prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.project.count({ where: { status: 'REVIEW' } }),
      prisma.project.count({ where: { status: 'COMPLETED' } })
    ])

    // Get recent activity
    const recentActivity = await prisma.activity.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { id: true, title: true } },
        campaign: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } }
      }
    })

    // Format activity for frontend
    const formattedActivity = recentActivity.map((activity) => {
      let title = activity.description || 'Activity'
      let type = 'Activity'
      let status = 'completed'

      if (activity.project?.title) {
        title = activity.project.title
        type = 'Project'
      } else if (activity.campaign?.name) {
        title = activity.campaign.name
        type = 'Campaign'
      } else if (activity.customer?.name) {
        title = activity.customer.name
        type = 'Customer'
      }

      // Determine status from activity type
      if (activity.type?.includes('created')) {
        status = 'completed'
      } else if (activity.type?.includes('updated')) {
        status = 'in_progress'
      }

      return {
        id: activity.id,
        title,
        type,
        status,
        time: getRelativeTime(activity.createdAt)
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
