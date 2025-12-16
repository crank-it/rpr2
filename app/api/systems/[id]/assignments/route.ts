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

    const userIds = Array.isArray(body.userIds) ? body.userIds : [body.userIds]

    // Create assignments
    const assignments = userIds.map((userId: string) => ({
      system_id: id,
      user_id: userId,
      assigned_by: performedBy,
      requires_acknowledgement: true
    }))

    const { data: createdAssignments, error: assignError } = await supabase
      .from('system_assignments')
      .insert(assignments)
      .select()

    if (assignError) {
      // Check for duplicate assignments
      if (assignError.code === '23505') {
        return NextResponse.json(
          { error: 'One or more users are already assigned' },
          { status: 400 }
        )
      }
      console.error('Failed to create assignments:', assignError)
      return NextResponse.json(
        { error: 'Failed to create assignments' },
        { status: 500 }
      )
    }

    // Create notifications for assigned users
    const notifications = userIds.map((userId: string) => ({
      system_id: id,
      user_id: userId,
      type: 'assigned',
      message: `You've been assigned to system: ${system.title}`
    }))

    await supabase.from('system_notifications').insert(notifications)

    // Log audit trail
    await supabase.from('system_audit_log').insert({
      system_id: id,
      user_id: performedBy,
      action: 'users_assigned',
      details: {
        user_ids: userIds,
        count: userIds.length
      }
    })

    return NextResponse.json({
      assignments: createdAssignments.map(a => ({
        id: a.id,
        userId: a.user_id,
        assignedBy: a.assigned_by,
        assignedAt: a.assigned_at,
        requiresAcknowledgement: a.requires_acknowledgement
      }))
    })
  } catch (error) {
    console.error('Failed to create assignments:', error)
    return NextResponse.json(
      { error: 'Failed to create assignments' },
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
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')
    const userId = searchParams.get('userId')
    const performedBy = getCurrentUserName()

    if (!assignmentId && !userId) {
      return NextResponse.json(
        { error: 'Either assignmentId or userId is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('system_assignments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('system_id', id)

    if (assignmentId) {
      query = query.eq('id', assignmentId)
    } else if (userId) {
      query = query.eq('user_id', userId)
    }

    const { error } = await query

    if (error) {
      console.error('Failed to remove assignment:', error)
      return NextResponse.json(
        { error: 'Failed to remove assignment' },
        { status: 500 }
      )
    }

    // Log audit trail
    await supabase.from('system_audit_log').insert({
      system_id: id,
      user_id: performedBy,
      action: 'user_unassigned',
      details: {
        assignment_id: assignmentId,
        removed_user_id: userId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove assignment:', error)
    return NextResponse.json(
      { error: 'Failed to remove assignment' },
      { status: 500 }
    )
  }
}
