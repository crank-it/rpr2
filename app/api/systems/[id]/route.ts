import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getCurrentUserName() {
  return 'User'
}

function isSubstantiveChange(oldData: any, newData: any): boolean {
  const substantiveFields = ['title', 'description']

  for (const field of substantiveFields) {
    if (oldData[field] !== newData[field]) {
      return true
    }
  }

  // Check if moving from Draft to another status
  if (oldData.status === 'Draft' && newData.status !== 'Draft') {
    return true
  }

  return false
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: system, error } = await supabase
      .from('systems')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error || !system) {
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      )
    }

    // Fetch related data
    const [linksData, assignmentsData, acknowledgementsData, commentsData] = await Promise.all([
      supabase
        .from('system_links')
        .select('*')
        .eq('system_id', id)
        .is('deleted_at', null)
        .order('sort_order'),
      supabase
        .from('system_assignments')
        .select('*')
        .eq('system_id', id)
        .is('deleted_at', null),
      supabase
        .from('system_acknowledgements')
        .select('*')
        .eq('system_id', id),
      supabase
        .from('system_comments')
        .select('*')
        .eq('system_id', id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
    ])

    const links = linksData.data || []
    const assignments = assignmentsData.data || []
    const acknowledgements = acknowledgementsData.data || []
    const comments = commentsData.data || []

    // Enrich assignments with acknowledgement status
    const enrichedAssignments = assignments.map(assignment => {
      const userAcks = acknowledgements.filter(ack => ack.user_id === assignment.user_id)
      const latestAck = userAcks.find(ack => ack.version === system.version)
      const hasOlderAck = userAcks.some(ack => ack.version < system.version)

      let status = 'pending'
      let acknowledgedAt = null
      let acknowledgedVersion = null

      if (latestAck) {
        status = 'acknowledged'
        acknowledgedAt = latestAck.acknowledged_at
        acknowledgedVersion = latestAck.version
      } else if (hasOlderAck) {
        status = 'update_required'
        const oldestAck = userAcks.sort((a, b) => b.version - a.version)[0]
        acknowledgedAt = oldestAck.acknowledged_at
        acknowledgedVersion = oldestAck.version
      }

      return {
        id: assignment.id,
        userId: assignment.user_id,
        assignedBy: assignment.assigned_by,
        assignedAt: assignment.assigned_at,
        requiresAcknowledgement: assignment.requires_acknowledgement,
        status,
        acknowledgedAt,
        acknowledgedVersion
      }
    })

    return NextResponse.json({
      id: system.id,
      title: system.title,
      category: system.category,
      status: system.status,
      description: system.description,
      version: system.version,
      createdBy: system.created_by,
      createdAt: system.created_at,
      updatedBy: system.updated_by,
      updatedAt: system.updated_at,
      links: links.map(link => ({
        id: link.id,
        title: link.title,
        url: link.url,
        description: link.description,
        sortOrder: link.sort_order,
        addedBy: link.added_by,
        createdAt: link.created_at
      })),
      assignments: enrichedAssignments,
      comments: comments.map(comment => ({
        id: comment.id,
        userId: comment.user_id,
        content: comment.content,
        isEdited: comment.is_edited,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at
      })),
      acknowledgements: acknowledgements.map(ack => ({
        id: ack.id,
        userId: ack.user_id,
        version: ack.version,
        acknowledgedAt: ack.acknowledged_at,
        notes: ack.notes
      }))
    })
  } catch (error) {
    console.error('Failed to fetch system:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const performedBy = getCurrentUserName()

    // Get current system
    const { data: currentSystem, error: fetchError } = await supabase
      .from('systems')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentSystem) {
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      )
    }

    // Check if changes are substantive
    const substantive = isSubstantiveChange(currentSystem, body)
    const newVersion = substantive ? currentSystem.version + 1 : currentSystem.version

    // Update system
    const { data: updatedSystem, error: updateError } = await supabase
      .from('systems')
      .update({
        title: body.title,
        category: body.category,
        status: body.status,
        description: body.description,
        version: newVersion,
        updated_by: performedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update system:', updateError)
      return NextResponse.json(
        { error: 'Failed to update system' },
        { status: 500 }
      )
    }

    // Log audit trail
    await supabase.from('system_audit_log').insert({
      system_id: id,
      user_id: performedBy,
      action: substantive ? 'updated_substantive' : 'updated_minor',
      details: {
        changes: body,
        old_version: currentSystem.version,
        new_version: newVersion
      }
    })

    // If substantive, notify assigned users
    if (substantive) {
      const { data: assignments } = await supabase
        .from('system_assignments')
        .select('user_id')
        .eq('system_id', id)
        .is('deleted_at', null)

      if (assignments && assignments.length > 0) {
        const notifications = assignments.map(assignment => ({
          system_id: id,
          user_id: assignment.user_id,
          type: 'updated',
          message: `${performedBy} updated system: ${updatedSystem.title}. Please review and acknowledge.`
        }))

        await supabase.from('system_notifications').insert(notifications)
      }
    }

    return NextResponse.json({
      id: updatedSystem.id,
      title: updatedSystem.title,
      category: updatedSystem.category,
      status: updatedSystem.status,
      description: updatedSystem.description,
      version: updatedSystem.version,
      updatedBy: updatedSystem.updated_by,
      updatedAt: updatedSystem.updated_at,
      substantiveChange: substantive
    })
  } catch (error) {
    console.error('Failed to update system:', error)
    return NextResponse.json(
      { error: 'Failed to update system' },
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
    const performedBy = getCurrentUserName()

    // Soft delete
    const { error } = await supabase
      .from('systems')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Failed to delete system:', error)
      return NextResponse.json(
        { error: 'Failed to delete system' },
        { status: 500 }
      )
    }

    // Log audit trail
    await supabase.from('system_audit_log').insert({
      system_id: id,
      user_id: performedBy,
      action: 'deleted',
      details: {}
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete system:', error)
    return NextResponse.json(
      { error: 'Failed to delete system' },
      { status: 500 }
    )
  }
}
