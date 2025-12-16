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
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params
    const body = await request.json()
    const userId = getCurrentUserName()

    const { data: comment, error } = await supabase
      .from('system_comments')
      .update({
        content: body.content,
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('system_id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update comment:', error)
      return NextResponse.json(
        { error: 'Failed to update comment' },
        { status: 500 }
      )
    }

    // Log audit trail
    await supabase.from('system_audit_log').insert({
      system_id: id,
      user_id: userId,
      action: 'comment_updated',
      details: {
        comment_id: commentId
      }
    })

    return NextResponse.json({
      id: comment.id,
      userId: comment.user_id,
      content: comment.content,
      isEdited: comment.is_edited,
      updatedAt: comment.updated_at
    })
  } catch (error) {
    console.error('Failed to update comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params
    const userId = getCurrentUserName()

    // Soft delete
    const { error } = await supabase
      .from('system_comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', commentId)
      .eq('system_id', id)

    if (error) {
      console.error('Failed to delete comment:', error)
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      )
    }

    // Log audit trail
    await supabase.from('system_audit_log').insert({
      system_id: id,
      user_id: userId,
      action: 'comment_deleted',
      details: {
        comment_id: commentId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
