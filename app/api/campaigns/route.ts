import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const audience = searchParams.get('audience')

    const where: any = {}
    if (status) where.status = status
    if (audience) where.audience = audience

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        _count: {
          select: {
            assets: true,
            activities: true
          }
        }
      },
      orderBy: { launchDate: 'desc' }
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error('Failed to fetch campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const campaign = await prisma.campaign.create({
      data: {
        name: body.name,
        description: body.description || null,
        audience: body.audience || 'BOTH',
        status: body.status || 'draft',
        launchDate: new Date(body.launchDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        distributorPreviewDate: body.distributorPreviewDate ? new Date(body.distributorPreviewDate) : null,
        salonLaunchDate: body.salonLaunchDate ? new Date(body.salonLaunchDate) : null,
        consumerLaunchDate: body.consumerLaunchDate ? new Date(body.consumerLaunchDate) : null,
        messaging: body.messaging || {},
        channels: body.channels || [],
        goals: body.goals || [],
        kpis: body.kpis || {},
        budget: body.budget || null,
        actualSpend: body.actualSpend || null
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'campaign_created',
        description: `Campaign "${campaign.name}" was created`,
        campaignId: campaign.id,
        performedBy: 'System'
      }
    })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Failed to create campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
