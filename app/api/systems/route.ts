import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getCurrentUserName() {
  return 'User'
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const assignedToMe = searchParams.get('assigned_to_me') === 'true'
    const needsAcknowledgement = searchParams.get('needs_acknowledgement') === 'true'
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'updated_at'

    // Base query - exclude soft deleted
    let query = supabase
      .from('systems')
      .select('*')
      .is('deleted_at', null)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort
    const ascending = !sort.startsWith('-')
    query = query.order(sortField, { ascending })

    const { data: systems, error } = await query

    if (error) {
      console.error('Failed to fetch systems:', error)
      return NextResponse.json(
        { error: 'Failed to fetch systems' },
        { status: 500 }
      )
    }

    // Fetch assignment and acknowledgement data for each system
    const systemIds = systems.map(s => s.id)

    const [assignmentsData, acknowledgementsData] = await Promise.all([
      supabase
        .from('system_assignments')
        .select('*')
        .in('system_id', systemIds)
        .is('deleted_at', null),
      supabase
        .from('system_acknowledgements')
        .select('*')
        .in('system_id', systemIds)
    ])

    // Group by system_id
    const assignmentsBySystem: Record<string, any[]> = {}
    const acksBySystem: Record<string, any[]> = {}

    assignmentsData.data?.forEach(assignment => {
      if (!assignmentsBySystem[assignment.system_id]) {
        assignmentsBySystem[assignment.system_id] = []
      }
      assignmentsBySystem[assignment.system_id].push(assignment)
    })

    acknowledgementsData.data?.forEach(ack => {
      if (!acksBySystem[ack.system_id]) {
        acksBySystem[ack.system_id] = []
      }
      acksBySystem[ack.system_id].push(ack)
    })

    // Transform systems with enriched data
    let enrichedSystems = systems.map(system => {
      const assignments = assignmentsBySystem[system.id] || []
      const acknowledgements = acksBySystem[system.id] || []

      const assignedUserCount = assignments.length
      const pendingCount = assignments.filter(assignment => {
        const userAcks = acknowledgements.filter(
          ack => ack.user_id === assignment.user_id && ack.version === system.version
        )
        return userAcks.length === 0
      }).length

      const currentUserAssignment = assignments.find(a => a.user_id === 'User') // Temp
      const currentUserAck = acknowledgements.find(
        ack => ack.user_id === 'User' && ack.version === system.version
      )

      let userAcknowledgementStatus = null
      if (currentUserAssignment) {
        if (currentUserAck) {
          userAcknowledgementStatus = 'acknowledged'
        } else {
          const hasOldAck = acknowledgements.some(ack => ack.user_id === 'User' && ack.version < system.version)
          userAcknowledgementStatus = hasOldAck ? 'update_required' : 'needs_acknowledgement'
        }
      }

      return {
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
        assignedUserCount,
        pendingAcknowledgements: pendingCount,
        userAcknowledgementStatus
      }
    })

    // Apply user-specific filters
    if (assignedToMe) {
      enrichedSystems = enrichedSystems.filter(s => s.userAcknowledgementStatus !== null)
    }
    if (needsAcknowledgement) {
      enrichedSystems = enrichedSystems.filter(
        s => s.userAcknowledgementStatus === 'needs_acknowledgement' ||
             s.userAcknowledgementStatus === 'update_required'
      )
    }

    return NextResponse.json(enrichedSystems)
  } catch (error) {
    console.error('Failed to fetch systems:', error)
    return NextResponse.json(
      { error: 'Failed to fetch systems' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const performedBy = getCurrentUserName()

    const { data: system, error } = await supabase
      .from('systems')
      .insert({
        title: body.title,
        category: body.category,
        status: body.status || 'Draft',
        description: body.description || null,
        version: 1,
        created_by: performedBy,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create system:', error)
      return NextResponse.json(
        { error: 'Failed to create system' },
        { status: 500 }
      )
    }

    // Log audit trail
    await supabase.from('system_audit_log').insert({
      system_id: system.id,
      user_id: performedBy,
      action: 'created',
      details: {
        title: system.title,
        category: system.category,
        status: system.status
      }
    })

    // Add links if provided
    if (body.links && body.links.length > 0) {
      const links = body.links.map((link: any, index: number) => ({
        system_id: system.id,
        title: link.title,
        url: link.url,
        description: link.description || null,
        sort_order: index,
        added_by: performedBy
      }))

      await supabase.from('system_links').insert(links)
    }

    // Assign users if provided
    if (body.assignedUserIds && body.assignedUserIds.length > 0) {
      const assignments = body.assignedUserIds.map((userId: string) => ({
        system_id: system.id,
        user_id: userId,
        assigned_by: performedBy,
        requires_acknowledgement: true
      }))

      await supabase.from('system_assignments').insert(assignments)

      // Create notifications for assigned users
      const notifications = body.assignedUserIds.map((userId: string) => ({
        system_id: system.id,
        user_id: userId,
        type: 'assigned',
        message: `You've been assigned to system: ${system.title}`
      }))

      await supabase.from('system_notifications').insert(notifications)
    }

    return NextResponse.json({
      id: system.id,
      title: system.title,
      category: system.category,
      status: system.status,
      description: system.description,
      version: system.version,
      createdBy: system.created_by,
      createdAt: system.created_at
    })
  } catch (error) {
    console.error('Failed to create system:', error)
    return NextResponse.json(
      { error: 'Failed to create system' },
      { status: 500 }
    )
  }
}
