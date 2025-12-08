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

    const { data: asset, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Transform to camelCase
    const transformedAsset = {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      url: asset.url,
      thumbnailUrl: asset.thumbnail_url,
      description: asset.description,
      tags: asset.tags || [],
      collection: asset.collection,
      projectId: asset.project_id,
      campaignId: asset.campaign_id,
      downloads: asset.downloads || 0,
      views: asset.views || 0,
      uploadedBy: asset.uploaded_by,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at
    }

    return NextResponse.json(transformedAsset)
  } catch (error) {
    console.error('Failed to fetch asset:', error)
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
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

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (body.name !== undefined) updateData.name = body.name
    if (body.type !== undefined) updateData.type = body.type
    if (body.url !== undefined) updateData.url = body.url
    if (body.thumbnailUrl !== undefined) updateData.thumbnail_url = body.thumbnailUrl
    if (body.description !== undefined) updateData.description = body.description
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.collection !== undefined) updateData.collection = body.collection
    if (body.projectId !== undefined) updateData.project_id = body.projectId
    if (body.campaignId !== undefined) updateData.campaign_id = body.campaignId

    const { data: asset, error } = await supabase
      .from('assets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update asset:', error.message, error.details)
      return NextResponse.json(
        { error: 'Failed to update asset', details: error.message },
        { status: 500 }
      )
    }

    // Transform to camelCase
    const transformedAsset = {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      url: asset.url,
      thumbnailUrl: asset.thumbnail_url,
      description: asset.description,
      tags: asset.tags || [],
      collection: asset.collection,
      projectId: asset.project_id,
      campaignId: asset.campaign_id,
      downloads: asset.downloads || 0,
      views: asset.views || 0,
      uploadedBy: asset.uploaded_by,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at
    }

    return NextResponse.json(transformedAsset)
  } catch (error) {
    console.error('Failed to update asset:', error)
    return NextResponse.json(
      { error: 'Failed to update asset' },
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
      .from('assets')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete asset:', error)
      return NextResponse.json(
        { error: 'Failed to delete asset' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete asset:', error)
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    )
  }
}
