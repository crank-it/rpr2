import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { currentUser } from '@clerk/nextjs/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getCurrentUserName() {
  try {
    const user = await currentUser()
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', user.id)
        .single()
      return userData?.name || userData?.email || user.emailAddresses?.[0]?.emailAddress || 'System'
    }
    return 'System'
  } catch {
    return 'System'
  }
}

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
    const performedBy = await getCurrentUserName()

    // Fetch existing asset to compare changes
    const { data: existingAsset } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single()

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

    // Helper to normalize values for comparison
    const normalize = (val: unknown): string => {
      if (val === null || val === undefined || val === '') return ''
      return String(val)
    }

    // Log detailed activities for each changed field
    const activities: { type: string; description: string; asset_id: string; performed_by: string }[] = []
    const assetName = asset.name

    if (existingAsset) {
      if (body.name !== undefined && normalize(body.name) !== normalize(existingAsset.name)) {
        activities.push({
          type: 'asset_updated',
          description: `Asset "${assetName}" updated name`,
          asset_id: asset.id,
          performed_by: performedBy
        })
      }
      if (body.type !== undefined && normalize(body.type) !== normalize(existingAsset.type)) {
        activities.push({
          type: 'asset_updated',
          description: `Asset "${assetName}" updated type`,
          asset_id: asset.id,
          performed_by: performedBy
        })
      }
      if (body.description !== undefined && normalize(body.description) !== normalize(existingAsset.description)) {
        activities.push({
          type: 'asset_updated',
          description: `Asset "${assetName}" updated description`,
          asset_id: asset.id,
          performed_by: performedBy
        })
      }
      if (body.tags !== undefined && JSON.stringify(body.tags) !== JSON.stringify(existingAsset.tags)) {
        activities.push({
          type: 'asset_updated',
          description: `Asset "${assetName}" updated tags`,
          asset_id: asset.id,
          performed_by: performedBy
        })
      }
      if (body.collection !== undefined && normalize(body.collection) !== normalize(existingAsset.collection)) {
        activities.push({
          type: 'asset_updated',
          description: `Asset "${assetName}" updated collection`,
          asset_id: asset.id,
          performed_by: performedBy
        })
      }
      if (body.projectId !== undefined && normalize(body.projectId) !== normalize(existingAsset.project_id)) {
        activities.push({
          type: 'asset_updated',
          description: `Asset "${assetName}" updated project`,
          asset_id: asset.id,
          performed_by: performedBy
        })
      }
    }

    // Only insert activities if there were actual changes
    if (activities.length > 0) {
      await supabase.from('activities').insert(activities)
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
