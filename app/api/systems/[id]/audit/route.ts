import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: auditLog, error } = await supabase
      .from('system_audit_log')
      .select('*')
      .eq('system_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch audit log:', error)
      return NextResponse.json(
        { error: 'Failed to fetch audit log' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      auditLog.map(entry => ({
        id: entry.id,
        userId: entry.user_id,
        action: entry.action,
        details: entry.details,
        createdAt: entry.created_at
      }))
    )
  } catch (error) {
    console.error('Failed to fetch audit log:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit log' },
      { status: 500 }
    )
  }
}
