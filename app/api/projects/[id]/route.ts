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

    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Get customer if exists
    let customer = null
    if (project.customer_id) {
      const { data: customerData } = await supabase
        .from('customers')
        .select('id, name, type')
        .eq('id', project.customer_id)
        .single()
      customer = customerData
    }

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
      updatedAt: project.updated_at,
      completedAt: project.completed_at,
      customer: customer,
      tasks: [],
      assets: [],
      activities: []
    }

    return NextResponse.json(transformedProject)
  } catch (error) {
    console.error('Failed to fetch project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
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

    const updateData: Record<string, unknown> = {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      due_date: body.dueDate || null,
      customer_id: body.customerId || null,
      updated_at: new Date().toISOString()
    }

    if (body.status === 'COMPLETED') {
      updateData.completed_at = new Date().toISOString()
    }

    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update project:', error)
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('activities').insert({
      type: 'project_updated',
      description: `Project "${project.title}" was updated`,
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
      updatedAt: project.updated_at,
      completedAt: project.completed_at
    }

    return NextResponse.json(transformedProject)
  } catch (error) {
    console.error('Failed to update project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
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
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete project:', error)
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
