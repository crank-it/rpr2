import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')

    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data: tasks, error } = await query

    if (error) {
      console.error('Failed to fetch tasks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    const transformedTasks = tasks.map(t => ({
      id: t.id,
      projectId: t.project_id,
      title: t.title,
      details: t.details,
      attachment: t.attachment,
      assigneeIds: t.assignee_ids || [],
      targetDate: t.target_date,
      status: t.status,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      completedAt: t.completed_at,
      createdFromTemplateId: t.created_from_template_id
    }))

    return NextResponse.json(transformedTasks)
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const insertData = {
      project_id: body.projectId,
      title: body.title,
      details: body.details || null,
      attachment: body.attachment || null,
      assignee_ids: body.assigneeIds || [],
      target_date: body.targetDate || null,
      status: body.status || 'DRAFT'
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Failed to create task:', error)
      console.error('Insert data was:', insertData)
      return NextResponse.json(
        { error: 'Failed to create task', details: error.message },
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
    console.error('Failed to create task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
