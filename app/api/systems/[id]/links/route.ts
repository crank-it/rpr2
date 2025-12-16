import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getCurrentUserName() {
  return 'User'
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const performedBy = getCurrentUserName()

    // Get current max sort_order
    const { data: maxSortData } = await supabase
      .from('system_links')
      .select('sort_order')
      .eq('system_id', id)
      .is('deleted_at', null)
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextSortOrder = (maxSortData && maxSortData[0]?.sort_order !== undefined)
      ? maxSortData[0].sort_order + 1
      : 0

    const { data: link, error } = await supabase
      .from('system_links')
      .insert({
        system_id: id,
        title: body.title,
        url: body.url,
        description: body.description || null,
        sort_order: body.sortOrder ?? nextSortOrder,
        added_by: performedBy
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create link:', error)
      return NextResponse.json(
        { error: 'Failed to create link' },
        { status: 500 }
      )
    }

    // Log audit trail
    await supabase.from('system_audit_log').insert({
      system_id: id,
      user_id: performedBy,
      action: 'link_added',
      details: {
        link_id: link.id,
        title: link.title,
        url: link.url
      }
    })

    return NextResponse.json({
      id: link.id,
      title: link.title,
      url: link.url,
      description: link.description,
      sortOrder: link.sort_order,
      addedBy: link.added_by,
      createdAt: link.created_at
    })
  } catch (error) {
    console.error('Failed to create link:', error)
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    )
  }
}
