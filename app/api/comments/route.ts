import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { currentUser } from '@clerk/nextjs/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getCurrentUserName(): Promise<string> {
  try {
    const user = await currentUser()
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single()
      return userData?.name || 'User'
    }
  } catch (error) {
    console.error('Failed to get current user:', error)
  }
  return 'User'
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entityType and entityId are required' },
        { status: 400 }
      )
    }

    // Fetch top-level comments (no parent)
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .is('parent_id', null)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch comments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }

    // Fetch replies for all comments
    const commentIds = (comments || []).map(c => c.id)
    let replies: Record<string, unknown[]> = {}

    if (commentIds.length > 0) {
      const { data: repliesData, error: repliesError } = await supabase
        .from('comments')
        .select('*')
        .in('parent_id', commentIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      if (!repliesError && repliesData) {
        // Group replies by parent_id
        replies = repliesData.reduce((acc, reply) => {
          const parentId = reply.parent_id
          if (!acc[parentId]) acc[parentId] = []
          acc[parentId].push({
            id: reply.id,
            author: reply.author,
            authorEmail: reply.author_email,
            content: reply.content,
            timestamp: reply.created_at,
            reactions: reply.reactions || []
          })
          return acc
        }, {} as Record<string, unknown[]>)
      }
    }

    // Transform to expected format
    // Append 'Z' to timestamps to indicate UTC timezone
    const transformedComments = (comments || []).map(comment => ({
      id: comment.id,
      author: comment.author,
      authorEmail: comment.author_email,
      content: comment.content,
      timestamp: comment.created_at ? comment.created_at.replace(' ', 'T') + 'Z' : null,
      reactions: comment.reactions || [],
      replies: (replies[comment.id] || []).map((reply: any) => ({
        ...reply,
        timestamp: reply.timestamp ? reply.timestamp.replace(' ', 'T') + 'Z' : null
      }))
    }))

    return NextResponse.json(transformedComments)
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { entityType, entityId, content, author, authorEmail, parentId } = body
    const performedBy = await getCurrentUserName()

    if (!entityType || !entityId || !content) {
      return NextResponse.json(
        { error: 'entityType, entityId, and content are required' },
        { status: 400 }
      )
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        content,
        author: author || performedBy,
        author_email: authorEmail || null,
        parent_id: parentId || null
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

    // Log activity based on entity type
    const activityData: any = {
      type: parentId ? 'comment_reply_added' : 'comment_added',
      description: parentId
        ? `${performedBy} replied to a comment`
        : `${performedBy} added a comment`,
      performed_by: performedBy
    }

    // Link activity to the appropriate entity
    if (entityType === 'PROJECT') {
      activityData.project_id = entityId
    } else if (entityType === 'CUSTOMER') {
      activityData.customer_id = entityId
    }

    await supabase.from('activities').insert(activityData)

    const transformedComment = {
      id: comment.id,
      author: comment.author,
      authorEmail: comment.author_email,
      content: comment.content,
      timestamp: comment.created_at ? comment.created_at.replace(' ', 'T') + 'Z' : null,
      reactions: comment.reactions || [],
      replies: []
    }

    return NextResponse.json(transformedComment, { status: 201 })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')
    const body = await request.json()
    const { content } = body

    if (!commentId) {
      return NextResponse.json(
        { error: 'commentId is required' },
        { status: 400 }
      )
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      )
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update comment:', error)
      return NextResponse.json(
        { error: 'Failed to update comment' },
        { status: 500 }
      )
    }

    const transformedComment = {
      id: comment.id,
      author: comment.author,
      authorEmail: comment.author_email,
      content: comment.content,
      timestamp: comment.created_at ? comment.created_at.replace(' ', 'T') + 'Z' : null,
      reactions: comment.reactions || []
    }

    return NextResponse.json(transformedComment)
  } catch (error) {
    console.error('Failed to update comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')
    const performedBy = await getCurrentUserName()

    if (!commentId) {
      return NextResponse.json(
        { error: 'commentId is required' },
        { status: 400 }
      )
    }

    // Fetch comment before deleting for activity log
    const { data: comment } = await supabase
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .single()

    // Soft delete by setting deleted_at
    const { error } = await supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', commentId)

    if (error) {
      console.error('Failed to delete comment:', error)
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      )
    }

    // Log activity
    if (comment) {
      const activityData: any = {
        type: 'comment_deleted',
        description: `${performedBy} deleted a comment`,
        performed_by: performedBy
      }

      // Link activity to the appropriate entity
      if (comment.entity_type === 'PROJECT') {
        activityData.project_id = comment.entity_id
      } else if (comment.entity_type === 'CUSTOMER') {
        activityData.customer_id = comment.entity_id
      }

      await supabase.from('activities').insert(activityData)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
