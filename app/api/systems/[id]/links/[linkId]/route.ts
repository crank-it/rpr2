import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getCurrentUserName() {
  return 'User'
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    const { id, linkId } = await params
    const body = await request.json()
    const performedBy = getCurrentUserName()

    const { data: link, error } = await supabase
      .from('system_links')
      .update({
        title: body.title,
        url: body.url,
        description: body.description || null
      })
      .eq('id', linkId)
      .eq('system_id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update link:', error)
      return NextResponse.json(
        { error: 'Failed to update link' },
        { status: 500 }
      )
    }

    // Log audit trail
    await supabase.from('system_audit_log').insert({
      system_id: id,
      user_id: performedBy,
      action: 'link_updated',
      details: {
        link_id: linkId,
        title: link.title,
        url: link.url
      }
    })

    return NextResponse.json({
      id: link.id,
      title: link.title,
      url: link.url,
      description: link.description,
      sortOrder: link.sort_order
    })
  } catch (error) {
    console.error('Failed to update link:', error)
    return NextResponse.json(
      { error: 'Failed to update link' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    const { id, linkId } = await params
    const performedBy = getCurrentUserName()

    // Soft delete
    const { error } = await supabase
      .from('system_links')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', linkId)
      .eq('system_id', id)

    if (error) {
      console.error('Failed to delete link:', error)
      return NextResponse.json(
        { error: 'Failed to delete link' },
        { status: 500 }
      )
    }

    // Log audit trail
    await supabase.from('system_audit_log').insert({
      system_id: id,
      user_id: performedBy,
      action: 'link_deleted',
      details: {
        link_id: linkId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete link:', error)
    return NextResponse.json(
      { error: 'Failed to delete link' },
      { status: 500 }
    )
  }
}
