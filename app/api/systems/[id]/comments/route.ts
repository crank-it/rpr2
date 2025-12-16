import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getCurrentUserName() {
  return 'User'
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: comments, error } = await supabase
      .from('system_comments')
      .select('*')
      .eq('system_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch comments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      comments.map(comment => ({
        id: comment.id,
        userId: comment.user_id,
        content: comment.content,
        isEdited: comment.is_edited,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at
      }))
    )
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const userId = getCurrentUserName()

    // Get system details for notifications
    const { data: system } = await supabase
      .from('systems')
      .select('title')
      .eq('id', id)
      .single()

    if (!system) {
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      )
    }

    const { data: comment, error } = await supabase
      .from('system_comments')
      .insert({
        system_id: id,
        user_id: userId,
        content: body.content
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create comment:', error)
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    // Get all assigned users except the commenter
    const { data: assignments } = await supabase
      .from('system_assignments')
      .select('user_id')
      .eq('system_id', id)
      .neq('user_id', userId)
      .is('deleted_at', null)

    // Create notifications for other assigned users
    if (assignments && assignments.length > 0) {
      const notifications = assignments.map(assignment => ({
        system_id: id,
        user_id: assignment.user_id,
        type: 'comment_added',
        message: `${userId} commented on system: ${system.title}`
      }))

      await supabase.from('system_notifications').insert(notifications)
    }

    // Log audit trail
    await supabase.from('system_audit_log').insert({
      system_id: id,
      user_id: userId,
      action: 'comment_added',
      details: {
        comment_id: comment.id
      }
    })

    return NextResponse.json({
      id: comment.id,
      userId: comment.user_id,
      content: comment.content,
      isEdited: comment.is_edited,
      createdAt: comment.created_at
    })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
