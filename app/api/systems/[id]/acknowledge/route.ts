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
    const userId = getCurrentUserName()

    // Get system current version
    const { data: system, error: systemError } = await supabase
      .from('systems')
      .select('version, title')
      .eq('id', id)
      .single()

    if (systemError || !system) {
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      )
    }

    // Create acknowledgement
    const { data: acknowledgement, error: ackError } = await supabase
      .from('system_acknowledgements')
      .insert({
        system_id: id,
        user_id: userId,
        version: system.version,
        acknowledged_at: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        notes: body.notes || null
      })
      .select()
      .single()

    if (ackError) {
      // Check if already acknowledged this version
      if (ackError.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'Already acknowledged this version' },
          { status: 400 }
        )
      }
      console.error('Failed to create acknowledgement:', ackError)
      return NextResponse.json(
        { error: 'Failed to create acknowledgement' },
        { status: 500 }
      )
    }

    // Log audit trail
    await supabase.from('system_audit_log').insert({
      system_id: id,
      user_id: userId,
      action: 'acknowledged',
      details: {
        version: system.version,
        has_notes: !!body.notes
      }
    })

    return NextResponse.json({
      id: acknowledgement.id,
      systemId: acknowledgement.system_id,
      userId: acknowledgement.user_id,
      version: acknowledgement.version,
      acknowledgedAt: acknowledgement.acknowledged_at,
      notes: acknowledgement.notes
    })
  } catch (error) {
    console.error('Failed to create acknowledgement:', error)
    return NextResponse.json(
      { error: 'Failed to create acknowledgement' },
      { status: 500 }
    )
  }
}
