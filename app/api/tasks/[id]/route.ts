import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { currentUser } from '@clerk/nextjs/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getCurrentUserName(): Promise<string> {
  try {
    const user = await currentUser()
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single()
      return userData?.name || 'User'
    }
  } catch (error) {
    console.error('Failed to get current user:', error)
  }
  return 'User'
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Failed to fetch task:', error)
      return NextResponse.json(
        { error: 'Failed to fetch task' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: task.id,
      projectId: task.project_id,
      title: task.title,
      details: task.details,
      attachment: task.attachment,
      assigneeIds: task.assignee_ids || [],
      targetDate: task.target_date,
      status: task.status,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      completedAt: task.completed_at,
      createdFromTemplateId: task.created_from_template_id
    })
  } catch (error) {
    console.error('Failed to fetch task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
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

    // Fetch old task for comparison
    const { data: oldTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    const updateData: any = {
      title: body.title,
      details: body.details,
      attachment: body.attachment,
      assignee_ids: body.assigneeIds || [],
      target_date: body.targetDate,
      status: body.status,
      updated_at: new Date().toISOString()
    }

    // Auto-set completed_at when status changes to COMPLETED
    if (body.status === 'COMPLETED') {
      updateData.completed_at = new Date().toISOString()
    } else if (body.status !== 'COMPLETED') {
      // Clear completed_at if status changes away from COMPLETED
      updateData.completed_at = null
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update task:', error)
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      )
    }

    // Log activity based on what changed
    if (oldTask) {
      if (body.status === 'COMPLETED' && oldTask.status !== 'COMPLETED') {
        await supabase.from('activities').insert({
          type: 'task_completed',
          description: `Task "${task.title}" was completed`,
          project_id: task.project_id,
          performed_by: performedBy
        })
      } else if (oldTask.status !== body.status) {
        await supabase.from('activities').insert({
          type: 'task_status_changed',
          description: `Task "${task.title}" status changed to ${body.status}`,
          project_id: task.project_id,
          performed_by: performedBy
        })
      } else {
        await supabase.from('activities').insert({
          type: 'task_updated',
          description: `Task "${task.title}" was updated`,
          project_id: task.project_id,
          performed_by: performedBy
        })
      }
    }

    return NextResponse.json({
      id: task.id,
      projectId: task.project_id,
      title: task.title,
      details: task.details,
      attachment: task.attachment,
      assigneeIds: task.assignee_ids || [],
      targetDate: task.target_date,
      status: task.status,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      completedAt: task.completed_at,
      createdFromTemplateId: task.created_from_template_id
    })
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
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
    const performedBy = await getCurrentUserName()

    // Fetch task before deleting for activity log
    const { data: task } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete task:', error)
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 }
      )
    }

    // Log activity
    if (task) {
      await supabase.from('activities').insert({
        type: 'task_deleted',
        description: `Task "${task.title}" was deleted`,
        project_id: task.project_id,
        performed_by: performedBy
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
