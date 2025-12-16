import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projectId, categoryIds } = body

    if (!projectId || !categoryIds || categoryIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing projectId or categoryIds' },
        { status: 400 }
      )
    }

    // Fetch templates for the specified categories
    const { data: templates, error: templatesError } = await supabase
      .from('task_templates')
      .select('*')
      .in('category_id', categoryIds)
      .order('sort_order')

    if (templatesError) {
      console.error('Failed to fetch templates:', templatesError)
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      )
    }

    // Fetch project to get created_at for calculating target dates
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('created_at')
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error('Failed to fetch project:', projectError)
      return NextResponse.json(
        { error: 'Failed to fetch project' },
        { status: 500 }
      )
    }

    // Create tasks from templates
    const tasksToCreate = templates.map(template => {
      const targetDate = new Date(project.created_at)
      targetDate.setDate(targetDate.getDate() + (template.target_days_offset || 0))

      return {
        project_id: projectId,
        title: template.title,
        details: template.details,
        assignee_ids: template.assignee_ids || [],
        target_date: targetDate.toISOString(),
        status: template.status || 'DRAFT',
        created_from_template_id: template.id
      }
    })

    if (tasksToCreate.length === 0) {
      return NextResponse.json([])
    }

    const { data: tasks, error: createError } = await supabase
      .from('tasks')
      .insert(tasksToCreate)
      .select()

    if (createError) {
      console.error('Failed to create tasks:', createError)
      return NextResponse.json(
        { error: 'Failed to create tasks' },
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
    console.error('Failed to create tasks from templates:', error)
    return NextResponse.json(
      { error: 'Failed to create tasks from templates' },
      { status: 500 }
    )
  }
}
