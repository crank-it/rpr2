import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        _count: {
          select: {
            projects: true,
            activities: true
          }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(customer)
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

    // Handle both snake_case (from form) and camelCase field names
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: body.name,
        type: body.type,
        email: body.email || null,
        phone: body.phone || null,
        website: body.website || null,
        address: body.address || null,
        notes: body.notes || null,
        primaryContact: body.primaryContact || body.primary_contact || null,
        accountManager: body.accountManager || null,
        tags: body.tags || [],
        brands: body.brands || [],
        spendingTier: body.spendingTier || body.spending_tier || null,
        annualSpend: body.annualSpend || body.annual_spend || null
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'customer_updated',
        description: `Customer "${customer.name}" was updated`,
        customerId: customer.id,
        performedBy: 'System'
      }
    })

    return NextResponse.json(customer)
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

    await prisma.customer.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete customer:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}
