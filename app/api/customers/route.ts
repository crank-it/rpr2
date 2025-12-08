import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: any = {}
    if (type) where.type = type

    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: {
            projects: true,
            activities: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(customers)
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

    // Handle both snake_case (from form) and camelCase field names
    const customer = await prisma.customer.create({
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
        type: 'customer_created',
        description: `Customer "${customer.name}" was added`,
        customerId: customer.id,
        performedBy: 'System'
      }
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Failed to create customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}
