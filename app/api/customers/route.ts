import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let query = supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }

    const { data: customers, error } = await query

    if (error) {
      console.error('Failed to fetch customers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      )
    }

    // Transform to camelCase for frontend
    const transformedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      type: customer.type,
      email: customer.email,
      phone: customer.phone,
      website: customer.website,
      address: customer.address,
      notes: customer.notes,
      tags: customer.tags || [],
      primaryContact: customer.primary_contact,
      accountManager: customer.account_manager,
      brands: customer.brands || [],
      spendingTier: customer.spending_tier,
      annualSpend: customer.annual_spend,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      lastContactAt: customer.last_contact_at,
      _count: { projects: 0, activities: 0 }
    }))

    return NextResponse.json(transformedCustomers)
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        name: body.name,
        type: body.type || 'SALON',
        email: body.email || null,
        phone: body.phone || null,
        website: body.website || null,
        address: body.address || null,
        notes: body.notes || null,
        primary_contact: body.primaryContact || body.primary_contact || null,
        account_manager: body.accountManager || null,
        tags: body.tags || [],
        brands: body.brands || [],
        spending_tier: body.spendingTier || body.spending_tier || null,
        annual_spend: body.annualSpend || body.annual_spend || null
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create customer:', error)
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('activities').insert({
      type: 'customer_created',
      description: `Customer "${customer.name}" was added`,
      customer_id: customer.id,
      performed_by: 'System'
    })

    // Transform to camelCase
    const transformedCustomer = {
      id: customer.id,
      name: customer.name,
      type: customer.type,
      email: customer.email,
      phone: customer.phone,
      website: customer.website,
      address: customer.address,
      notes: customer.notes,
      tags: customer.tags || [],
      primaryContact: customer.primary_contact,
      accountManager: customer.account_manager,
      brands: customer.brands || [],
      spendingTier: customer.spending_tier,
      annualSpend: customer.annual_spend,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at
    }

    return NextResponse.json(transformedCustomer)
  } catch (error) {
    console.error('Failed to create customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}
