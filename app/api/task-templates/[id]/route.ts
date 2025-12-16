import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data: template, error } = await supabase
      .from('task_templates')
      .update({
        title: body.title,
        details: body.details,
        assignee_ids: body.assigneeIds || [],
        target_days_offset: body.targetDaysOffset,
        status: body.status,
        sort_order: body.sortOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update template:', error)
      return NextResponse.json(
        { error: 'Failed to update template' },
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
    console.error('Failed to update template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
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
      .from('task_templates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete template:', error)
      return NextResponse.json(
        { error: 'Failed to delete template' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
