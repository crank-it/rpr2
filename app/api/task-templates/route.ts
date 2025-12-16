import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    let query = supabase
      .from('task_templates')
      .select('*')
      .order('sort_order')

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data: templates, error } = await query

    if (error) {
      console.error('Failed to fetch templates:', error)
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      )
    }

    const transformedTemplates = templates.map(t => ({
      id: t.id,
      categoryId: t.category_id,
      title: t.title,
      details: t.details,
      assigneeIds: t.assignee_ids || [],
      targetDaysOffset: t.target_days_offset,
      status: t.status,
      sortOrder: t.sort_order,
      createdAt: t.created_at,
      updatedAt: t.updated_at
    }))

    return NextResponse.json(transformedTemplates)
  } catch (error) {
    console.error('Failed to fetch templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data: template, error } = await supabase
      .from('task_templates')
      .insert({
        category_id: body.categoryId,
        title: body.title,
        details: body.details || null,
        assignee_ids: body.assigneeIds || [],
        target_days_offset: body.targetDaysOffset || 0,
        status: body.status || 'DRAFT',
        sort_order: body.sortOrder || 0
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create template:', error)
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: template.id,
      categoryId: template.category_id,
      title: template.title,
      details: template.details,
      assigneeIds: template.assignee_ids || [],
      targetDaysOffset: template.target_days_offset,
      status: template.status,
      sortOrder: template.sort_order,
      createdAt: template.created_at,
      updatedAt: template.updated_at
    })
  } catch (error) {
    console.error('Failed to create template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
