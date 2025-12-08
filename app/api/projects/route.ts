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
    const customerId = searchParams.get('customerId')

    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }
    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    const { data: projects, error } = await query

    if (error) {
      console.error('Failed to fetch projects:', error)
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    // Transform to camelCase for frontend
    const transformedProjects = projects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      priority: project.priority,
      dueDate: project.due_date,
      customerId: project.customer_id,
      owner: project.owner,
      assignees: project.assignees || [],
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      completedAt: project.completed_at,
      customer: null,
      _count: { tasks: 0, assets: 0 }
    }))

    return NextResponse.json(transformedProjects)
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

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        title: body.title,
        description: body.description || null,
        status: body.status || 'DRAFT',
        priority: body.priority || 'MEDIUM',
        due_date: body.dueDate || null,
        customer_id: body.customerId || null,
        owner: body.owner || 'Team',
        assignees: body.assignees || []
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create project:', error)
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('activities').insert({
      type: 'project_created',
      description: `Project "${project.title}" was created`,
      project_id: project.id,
      performed_by: 'System'
    })

    // Transform to camelCase
    const transformedProject = {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      priority: project.priority,
      dueDate: project.due_date,
      customerId: project.customer_id,
      owner: project.owner,
      assignees: project.assignees || [],
      createdAt: project.created_at,
      updatedAt: project.updated_at
    }

    return NextResponse.json(transformedProject)
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
