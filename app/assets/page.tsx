'use client'

import { Upload, Search, Filter, Image as ImageIcon, FileText, Video, File, Pencil } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UploadAssetModal } from '@/components/assets/UploadAssetModal'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface Asset {
  id: string
  name: string
  type: string
  url: string
  description: string | null
  tags: string[]
  thumbnailUrl?: string | null
  uploadedBy: string
  downloads?: number
  views?: number
  createdAt: string
}

export default function AssetsPage() {
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)

  const fetchAssets = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/assets')
      if (!response.ok) {
        throw new Error('Failed to fetch assets')
      }
      const data = await response.json()
      setAssets(data)
    } catch (error) {
      console.error('Error fetching assets:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  const handleAssetUploaded = async (newAsset: any) => {
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAsset.name,
          type: newAsset.type || 'IMAGE',
          url: newAsset.url || '',
          description: newAsset.description || null,
          tags: newAsset.tags || []
        })
      })
      if (!response.ok) {
        throw new Error('Failed to create asset')
      }
      const data = await response.json()
      setAssets([data, ...assets])
    } catch (error) {
      console.error('Error creating asset:', error)
    }
    setIsUploadModalOpen(false)
  }

  const handleAssetUpdated = async (updatedAsset: any) => {
    if (!editingAsset) return

    try {
      const response = await fetch(`/api/assets/${editingAsset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedAsset.name,
          type: updatedAsset.type,
          url: updatedAsset.url,
          description: updatedAsset.description,
          tags: updatedAsset.tags
        })
      })
      if (!response.ok) {
        throw new Error('Failed to update asset')
      }
      const data = await response.json()
      setAssets(assets.map(a => a.id === editingAsset.id ? data : a))
    } catch (error) {
      console.error('Error updating asset:', error)
    }
    setEditingAsset(null)
  }

  const handleEditClick = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingAsset(asset)
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <ImageIcon className="h-5 w-5" />
      case 'VIDEO':
        return <Video className="h-5 w-5" />
      case 'DOCUMENT':
      case 'PDF':
        return <FileText className="h-5 w-5" />
      default:
        return <File className="h-5 w-5" />
    }
  }

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Assets</h1>
          <p className="text-muted-foreground mt-2">
            Manage your digital asset library
          </p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Assets
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search assets..."
              className="pl-14"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </Card>

      {/* Assets Grid */}
      {loading ? (
        <Card className="p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading assets...</p>
        </Card>
      ) : filteredAssets.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
              <ImageIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No assets found' : 'No assets yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {searchQuery ? 'Try a different search term' : 'Upload images, videos, and documents to your library'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsUploadModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Your First Asset
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <Card
              key={asset.id}
              className="group cursor-pointer overflow-hidden card-hover"
              onClick={() => router.push(`/assets/${asset.id}`)}
            >
              {/* Asset Preview */}
              <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
                {asset.type === 'IMAGE' && asset.url ? (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-gray-400">
                    {getAssetIcon(asset.type)}
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 bg-white/90 backdrop-blur-sm hover:bg-white"
                    onClick={(e) => handleEditClick(asset, e)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                    {asset.type}
                  </Badge>
                </div>
              </div>

              {/* Asset Info */}
              <div className="p-4">
                <h3 className="font-medium text-sm truncate group-hover:text-gray-900 transition-colors mb-1">
                  {asset.name}
                </h3>
                {asset.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {asset.description}
                  </p>
                )}

                {/* Tags */}
                {asset.tags && asset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {asset.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs py-0">
                        {tag}
                      </Badge>
                    ))}
                    {asset.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs py-0">
                        +{asset.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                  <span>Uploaded by {asset.uploadedBy}</span>
                  <span>{formatDate(asset.createdAt)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <UploadAssetModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAssetUploaded={handleAssetUploaded}
      />

      {editingAsset && (
        <UploadAssetModal
          isOpen={!!editingAsset}
          onClose={() => setEditingAsset(null)}
          onAssetUploaded={handleAssetUpdated}
          initialData={editingAsset}
          isEditing={true}
        />
      )}
    </div>
  )
}
