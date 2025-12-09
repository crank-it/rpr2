'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Calendar, Tag, FolderOpen, Pencil, Image as ImageIcon, FileText, Video, File, Loader2 } from 'lucide-react'
import { CommentThread } from '@/components/comments/CommentThread'
import { UploadAssetModal } from '@/components/assets/UploadAssetModal'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Asset {
  id: string
  name: string
  type: string
  url: string
  thumbnailUrl?: string | null
  description: string | null
  tags: string[]
  collection?: string | null
  projectId?: string | null
  campaignId?: string | null
  uploadedBy: string
  createdAt: string
  updatedAt: string
}

export default function AssetDetailPage() {
  const params = useParams()
  const assetId = params.id as string
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const fetchAsset = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/assets/${assetId}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Asset not found')
        } else {
          throw new Error('Failed to fetch asset')
        }
        return
      }
      const data = await response.json()
      setAsset(data)
    } catch (error) {
      console.error('Error fetching asset:', error)
      setError('Failed to load asset')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (assetId) {
      fetchAsset()
    }
  }, [assetId])

  const handleAssetUpdated = async (updatedAsset: any) => {
    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedAsset.name,
          type: updatedAsset.type,
          url: updatedAsset.url,
          description: updatedAsset.description,
          tags: updatedAsset.tags,
          collection: updatedAsset.collection
        })
      })
      if (!response.ok) {
        throw new Error('Failed to update asset')
      }
      const data = await response.json()
      setAsset(data)
    } catch (error) {
      console.error('Error updating asset:', error)
    }
    setIsEditModalOpen(false)
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <ImageIcon className="h-6 w-6" />
      case 'VIDEO':
        return <Video className="h-6 w-6" />
      case 'DOCUMENT':
      case 'PDF':
        return <FileText className="h-6 w-6" />
      default:
        return <File className="h-6 w-6" />
    }
  }

  const handleDownload = async () => {
    if (!asset?.url) return

    setIsDownloading(true)
    try {
      const response = await fetch(asset.url)
      const blob = await response.blob()

      // Get file extension from URL or default based on type
      const urlParts = asset.url.split('.')
      const extension = urlParts[urlParts.length - 1].split('?')[0] || getDefaultExtension(asset.type)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${asset.name}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback: open in new tab
      window.open(asset.url, '_blank')
    } finally {
      setIsDownloading(false)
    }
  }

  const getDefaultExtension = (type: string) => {
    switch (type) {
      case 'IMAGE': return 'png'
      case 'VIDEO': return 'mp4'
      case 'DOCUMENT': return 'pdf'
      case 'PDF': return 'pdf'
      default: return 'file'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Link
          href="/assets"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assets
        </Link>
        <Card className="p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading asset...</p>
        </Card>
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="space-y-6">
        <Link
          href="/assets"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assets
        </Link>
        <Card className="p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mx-auto mb-4">
            <ImageIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{error || 'Asset not found'}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            The asset you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/assets">
            <Button>View All Assets</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/assets"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assets
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
              <div className="text-gray-600">
                {getAssetIcon(asset.type)}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">{asset.name}</h1>
              <p className="text-muted-foreground max-w-3xl">
                {asset.description || 'No description'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            {asset.url && (
              <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isDownloading ? 'Downloading...' : 'Download'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Asset Preview */}
        <Card className="col-span-2">
          <CardContent className="p-0">
            <div className="aspect-video bg-gray-100 flex items-center justify-center relative rounded-t-xl overflow-hidden">
              {asset.type === 'IMAGE' && asset.url ? (
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  {getAssetIcon(asset.type)}
                  <p className="text-sm mt-4">Preview not available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Asset Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Type</p>
              <Badge variant="secondary">{asset.type}</Badge>
            </div>
            <Separator />
            {asset.collection && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Collection
                  </p>
                  <p className="text-sm font-medium">{asset.collection}</p>
                </div>
                <Separator />
              </>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Uploaded By</p>
              <p className="text-sm font-medium">{asset.uploadedBy || 'Unknown'}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upload Date
              </p>
              <p className="text-sm font-medium">{formatDate(asset.createdAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags */}
      {asset.tags && asset.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {asset.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-200"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Communication */}
      <div>
        <CommentThread entityType="ASSET" entityId={asset.id} />
      </div>

      <UploadAssetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onAssetUploaded={handleAssetUpdated}
        initialData={asset}
        isEditing={true}
      />
    </div>
  )
}
