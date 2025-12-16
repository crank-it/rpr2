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

    const { data: category, error } = await supabase
      .from('project_categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      customFields: category.custom_fields || [],
      createdAt: category.created_at,
      updatedAt: category.updated_at
    })
  } catch (error) {
    console.error('Failed to fetch category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
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

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.color !== undefined) updateData.color = body.color
    if (body.customFields !== undefined) updateData.custom_fields = body.customFields

    const { data: category, error } = await supabase
      .from('project_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update category:', error)
      return NextResponse.json(
        { error: 'Failed to update category' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      customFields: category.custom_fields || [],
      createdAt: category.created_at,
      updatedAt: category.updated_at
    })
  } catch (error) {
    console.error('Failed to update category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
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

    // Check if category is used by any projects
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .contains('category_ids', [id])

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that is used by projects', projectCount: count },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('project_categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete category:', error)
      return NextResponse.json(
        { error: 'Failed to delete category' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
