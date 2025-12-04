'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Eye, Calendar, Tag, FolderOpen, Pencil, Image as ImageIcon, FileText, Video, File } from 'lucide-react'
import { CommentThread } from '@/components/comments/CommentThread'
import { UploadAssetModal } from '@/components/assets/UploadAssetModal'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const DEMO_ASSETS = [
  {
    id: '1',
    name: 'Summer Collection Hero Banner',
    type: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
    description: 'Main hero image for summer campaign landing page',
    tags: ['summer', 'hero', 'banner', 'campaign'],
    collection: 'Summer 2024',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    downloads: 45,
    views: 234,
    fileSize: '2.4 MB',
    dimensions: '1920x1080',
    uploadedBy: 'Sarah Mitchell'
  },
  {
    id: '2',
    name: 'Product Photography - Color Line',
    type: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80',
    description: 'Professional product shots of new color collection',
    tags: ['product', 'photography', 'color', 'premium'],
    collection: 'Summer 2024',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    downloads: 128,
    views: 567,
    fileSize: '3.1 MB',
    dimensions: '2400x1600',
    uploadedBy: 'Ben Thompson'
  },
  {
    id: '3',
    name: 'Salon Training Video',
    type: 'VIDEO',
    url: '',
    description: 'Step-by-step application techniques for stylist education',
    tags: ['training', 'education', 'salon', 'tutorial'],
    collection: 'Training Materials',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    downloads: 89,
    views: 412,
    fileSize: '145 MB',
    duration: '12:34',
    uploadedBy: 'Michael Chen'
  },
  {
    id: '4',
    name: 'Brand Guidelines 2024',
    type: 'DOCUMENT',
    url: '',
    description: 'Complete brand identity and usage guidelines',
    tags: ['brand', 'guidelines', 'identity', 'assets'],
    collection: 'Brand Assets',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    downloads: 234,
    views: 1045,
    fileSize: '8.7 MB',
    pages: 42,
    uploadedBy: 'Sarah Mitchell'
  }
]

export default function AssetDetailPage() {
  const params = useParams()
  const assetId = params.id as string
  const asset = DEMO_ASSETS.find(a => a.id === assetId) || DEMO_ASSETS[0]
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleAssetUpdated = (updatedAsset: any) => {
    // In a real app, this would update the asset in state/database
    console.log('Asset updated:', updatedAsset)
    setIsEditModalOpen(false)
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <ImageIcon className="h-6 w-6" />
      case 'VIDEO':
        return <Video className="h-6 w-6" />
      case 'DOCUMENT':
      case 'PRESENTATION':
        return <FileText className="h-6 w-6" />
      default:
        return <File className="h-6 w-6" />
    }
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
                {asset.description}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
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
                <div className="text-gray-400">
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
              <p className="text-sm text-muted-foreground mb-1">File Size</p>
              <p className="text-sm font-medium">{asset.fileSize}</p>
            </div>
            <Separator />
            {asset.dimensions && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dimensions</p>
                  <p className="text-sm font-medium">{asset.dimensions}</p>
                </div>
                <Separator />
              </>
            )}
            {asset.duration && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="text-sm font-medium">{asset.duration}</p>
                </div>
                <Separator />
              </>
            )}
            {asset.pages && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pages</p>
                  <p className="text-sm font-medium">{asset.pages}</p>
                </div>
                <Separator />
              </>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Uploaded By</p>
              <p className="text-sm font-medium">{asset.uploadedBy}</p>
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
      {asset.tags.length > 0 && (
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

      {/* Usage Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-400" />
              Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{asset.views}</div>
            <p className="text-xs text-muted-foreground mt-1">Total views</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Download className="h-4 w-4 text-gray-400" />
              Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{asset.downloads}</div>
            <p className="text-xs text-muted-foreground mt-1">Total downloads</p>
          </CardContent>
        </Card>
      </div>

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
