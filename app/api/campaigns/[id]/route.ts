import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        assets: {
          orderBy: { createdAt: 'desc' }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Failed to fetch campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
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

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        audience: body.audience,
        status: body.status,
        launchDate: body.launchDate ? new Date(body.launchDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : null,
        distributorPreviewDate: body.distributorPreviewDate ? new Date(body.distributorPreviewDate) : null,
        salonLaunchDate: body.salonLaunchDate ? new Date(body.salonLaunchDate) : null,
        consumerLaunchDate: body.consumerLaunchDate ? new Date(body.consumerLaunchDate) : null,
        budget: body.budget,
        actualSpend: body.actualSpend,
        goals: body.goals,
        channels: body.channels
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'campaign_updated',
        description: `Campaign "${campaign.name}" was updated`,
        campaignId: campaign.id,
        performedBy: 'System'
      }
    })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Failed to update campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
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

    await prisma.campaign.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
