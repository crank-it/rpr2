import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')

    const where: any = {}
    if (status) where.status = status
    if (customerId) where.customerId = customerId

    const projects = await prisma.project.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        _count: {
          select: {
            tasks: true,
            assets: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const project = await prisma.project.create({
      data: {
        title: body.title,
        description: body.description,
        status: body.status || 'DRAFT',
        priority: body.priority || 'MEDIUM',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        customerId: body.customerId || null,
        owner: body.owner || 'Team',
        assignees: body.assignees || []
      },
      include: {
        customer: true
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'project_created',
        description: `Project "${project.title}" was created`,
        projectId: project.id,
        performedBy: 'System'
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
