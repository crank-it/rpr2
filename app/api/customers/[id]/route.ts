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
    const performedBy = await getCurrentUserName()

    // Fetch existing customer to compare changes
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

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

    // Helper to normalize values for comparison (handles null, undefined, empty string)
    const normalize = (val: unknown): string => {
      if (val === null || val === undefined || val === '') return ''
      return String(val)
    }

    // Log detailed activities for each changed field
    const activities: { type: string; description: string; customer_id: string; performed_by: string }[] = []
    const customerName = customer.name

    if (existingCustomer) {
      if (body.name !== undefined && normalize(body.name) !== normalize(existingCustomer.name)) {
        activities.push({
          type: 'customer_updated',
          description: `Customer "${customerName}" updated name`,
          customer_id: customer.id,
          performed_by: performedBy
        })
      }
      if (body.type !== undefined && normalize(body.type) !== normalize(existingCustomer.type)) {
        activities.push({
          type: 'customer_updated',
          description: `Customer "${customerName}" updated type to "${body.type}"`,
          customer_id: customer.id,
          performed_by: performedBy
        })
      }
      if (body.email !== undefined && normalize(body.email) !== normalize(existingCustomer.email)) {
        activities.push({
          type: 'customer_updated',
          description: `Customer "${customerName}" updated email`,
          customer_id: customer.id,
          performed_by: performedBy
        })
      }
      if (body.phone !== undefined && normalize(body.phone) !== normalize(existingCustomer.phone)) {
        activities.push({
          type: 'customer_updated',
          description: `Customer "${customerName}" updated phone`,
          customer_id: customer.id,
          performed_by: performedBy
        })
      }
      if (body.address !== undefined && normalize(body.address) !== normalize(existingCustomer.address)) {
        activities.push({
          type: 'customer_updated',
          description: `Customer "${customerName}" updated address`,
          customer_id: customer.id,
          performed_by: performedBy
        })
      }
      if (body.website !== undefined && normalize(body.website) !== normalize(existingCustomer.website)) {
        activities.push({
          type: 'customer_updated',
          description: `Customer "${customerName}" updated website`,
          customer_id: customer.id,
          performed_by: performedBy
        })
      }
      const primaryContact = body.primaryContact || body.primary_contact
      if (primaryContact !== undefined && normalize(primaryContact) !== normalize(existingCustomer.primary_contact)) {
        activities.push({
          type: 'customer_updated',
          description: `Customer "${customerName}" updated primary contact`,
          customer_id: customer.id,
          performed_by: performedBy
        })
      }
      if (body.notes !== undefined && normalize(body.notes) !== normalize(existingCustomer.notes)) {
        activities.push({
          type: 'customer_updated',
          description: `Customer "${customerName}" updated notes`,
          customer_id: customer.id,
          performed_by: performedBy
        })
      }
      if (body.brands !== undefined && JSON.stringify(body.brands) !== JSON.stringify(existingCustomer.brands)) {
        activities.push({
          type: 'customer_updated',
          description: `Customer "${customerName}" updated brands`,
          customer_id: customer.id,
          performed_by: performedBy
        })
      }
      const spendingTier = body.spendingTier || body.spending_tier
      if (spendingTier !== undefined && normalize(spendingTier) !== normalize(existingCustomer.spending_tier)) {
        activities.push({
          type: 'customer_updated',
          description: `Customer "${customerName}" updated spending tier`,
          customer_id: customer.id,
          performed_by: performedBy
        })
      }
      const annualSpend = body.annualSpend || body.annual_spend
      if (annualSpend !== undefined && normalize(annualSpend) !== normalize(existingCustomer.annual_spend)) {
        activities.push({
          type: 'customer_updated',
          description: `Customer "${customerName}" updated annual spend`,
          customer_id: customer.id,
          performed_by: performedBy
        })
      }
    }

    // Only insert activities if there were actual changes
    if (activities.length > 0) {
      await supabase.from('activities').insert(activities)
    }

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
