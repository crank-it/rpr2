import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Fetch all categories
    const { data: categories, error } = await supabase
      .from('project_categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Failed to fetch categories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    // Get project count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const { count } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .contains('category_ids', [category.id])

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          color: category.color,
          customFields: category.custom_fields || [],
          createdAt: category.created_at,
          updatedAt: category.updated_at,
          projectCount: count || 0
        }
      })
    )

    return NextResponse.json(categoriesWithCounts)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data: category, error } = await supabase
      .from('project_categories')
      .insert({
        name: body.name,
        description: body.description || null,
        color: body.color || '#6366f1'
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create category:', error)
      return NextResponse.json(
        { error: 'Failed to create category' },
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
    console.error('Failed to create category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
