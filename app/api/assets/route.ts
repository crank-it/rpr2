import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getCurrentUserName() {
  return 'User'
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const collection = searchParams.get('collection')

    let query = supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }
    if (collection) {
      query = query.eq('collection', collection)
    }

    const { data: assets, error } = await query

    if (error) {
      console.error('Failed to fetch assets:', error)
      return NextResponse.json(
        { error: 'Failed to fetch assets' },
        { status: 500 }
      )
    }

    // Transform to camelCase for frontend
    const transformedAssets = assets.map(asset => ({
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
    }))

    return NextResponse.json(transformedAssets)
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
    const performedBy = await getCurrentUserName()

    const { data: asset, error } = await supabase
      .from('assets')
      .insert({
        name: body.name,
        type: body.type || 'IMAGE',
        url: body.url || '',
        thumbnail_url: body.thumbnailUrl || null,
        description: body.description || null,
        tags: body.tags || [],
        collection: body.collection || null,
        project_id: body.projectId || null,
        uploaded_by: body.uploadedBy || 'System'
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create asset:', error)
      return NextResponse.json(
        { error: 'Failed to create asset' },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('activities').insert({
      type: 'asset_created',
      description: `Asset "${asset.name}" was created`,
      asset_id: asset.id,
      performed_by: performedBy
    })

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
    console.error('Failed to create asset:', error)
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    )
  }
}
