import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getCurrentUserName() {
  return 'User'
}

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
      categoryIds: project.category_ids || [],
      assets: project.assets || [],
      customFieldValues: project.custom_field_values || {},
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      completedAt: project.completed_at,
      customer: customer,
      tasks: [],
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
    const performedBy = await getCurrentUserName()

    // Fetch existing project to compare changes
    const { data: existingProject } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    const updateData: Record<string, unknown> = {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      due_date: body.dueDate || null,
      customer_id: body.customerId || null,
      assignees: body.assignees || [],
      category_ids: body.categoryIds || [],
      assets: body.assets || [],
      custom_field_values: body.customFieldValues || {},
      updated_at: new Date().toISOString()
    }

    if (body.status === 'COMPLETED') {
      updateData.completed_at = new Date().toISOString()
    }

    // Detect newly added categories for template task creation
    const newCategoryIds = body.categoryIds?.filter(
      (catId: string) => !existingProject?.category_ids?.includes(catId)
    )

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

    // Helper to normalize values for comparison (handles null, undefined, empty string, and dates)
    const normalize = (val: unknown): string => {
      if (val === null || val === undefined || val === '') return ''
      if (typeof val === 'string' && val.includes('T')) {
        return val.split('T')[0]
      }
      return String(val)
    }

    // Log detailed activities for each changed field
    const activities: { type: string; description: string; project_id: string; performed_by: string }[] = []
    const projectTitle = project.title

    if (existingProject) {
      if (body.status !== undefined && normalize(body.status) !== normalize(existingProject.status)) {
        activities.push({
          type: 'project_updated',
          description: `Project "${projectTitle}" updated status`,
          project_id: project.id,
          performed_by: performedBy
        })
      }
      if (body.title !== undefined && normalize(body.title) !== normalize(existingProject.title)) {
        activities.push({
          type: 'project_updated',
          description: `Project "${projectTitle}" updated title`,
          project_id: project.id,
          performed_by: performedBy
        })
      }
      if (body.description !== undefined && normalize(body.description) !== normalize(existingProject.description)) {
        activities.push({
          type: 'project_updated',
          description: `Project "${projectTitle}" updated description`,
          project_id: project.id,
          performed_by: performedBy
        })
      }
      if (body.priority !== undefined && normalize(body.priority) !== normalize(existingProject.priority)) {
        activities.push({
          type: 'project_updated',
          description: `Project "${projectTitle}" updated priority`,
          project_id: project.id,
          performed_by: performedBy
        })
      }
      if (body.dueDate !== undefined && normalize(body.dueDate) !== normalize(existingProject.due_date)) {
        activities.push({
          type: 'project_updated',
          description: `Project "${projectTitle}" updated due date`,
          project_id: project.id,
          performed_by: performedBy
        })
      }
      if (body.customerId !== undefined && normalize(body.customerId) !== normalize(existingProject.customer_id)) {
        activities.push({
          type: 'project_updated',
          description: `Project "${projectTitle}" updated customer`,
          project_id: project.id,
          performed_by: performedBy
        })
      }
    }

    // Only insert activities if there were actual changes
    if (activities.length > 0) {
      await supabase.from('activities').insert(activities)
    }

    // Auto-create tasks from templates for newly added categories
    if (newCategoryIds && newCategoryIds.length > 0) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tasks/create-from-templates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: project.id,
            categoryIds: newCategoryIds
          })
        })
      } catch (error) {
        console.error('Failed to create tasks from templates:', error)
        // Don't fail the project update if template tasks fail
      }
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
      categoryIds: project.category_ids || [],
      assets: project.assets || [],
      customFieldValues: project.custom_field_values || {},
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
