import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const collection = searchParams.get('collection')

    const where: any = {}
    if (type) where.type = type
    if (collection) where.collection = collection

    const assets = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(assets)
  } catch (error) {
    console.error('Failed to fetch assets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const asset = await prisma.asset.create({
      data: {
        name: body.name,
        type: body.type,
        url: body.url,
        description: body.description || null,
        tags: body.tags || [],
        collection: body.collection || null,
        uploadedBy: 'System'
      }
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Failed to create asset:', error)
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    )
  }
}
