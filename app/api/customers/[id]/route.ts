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

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Get project count
    const { count: projectCount } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', id)

    // Get projects list
    const { data: projects } = await supabase
      .from('projects')
      .select('id, title, status')
      .eq('customer_id', id)

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
      updatedAt: customer.updated_at,
      lastContactAt: customer.last_contact_at,
      projects: projects || [],
      _count: {
        projects: projectCount || 0,
        activities: 0
      }
    }

    return NextResponse.json(transformedCustomer)
  } catch (error) {
    console.error('Failed to fetch customer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data: customer, error } = await supabase
      .from('customers')
      .update({
        name: body.name,
        type: body.type,
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
        annual_spend: body.annualSpend || body.annual_spend || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update customer:', error)
      return NextResponse.json(
        { error: 'Failed to update customer' },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('activities').insert({
      type: 'customer_updated',
      description: `Customer "${customer.name}" was updated`,
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
    console.error('Failed to update customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
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

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete customer:', error)
      return NextResponse.json(
        { error: 'Failed to delete customer' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete customer:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}
