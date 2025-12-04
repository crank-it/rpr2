'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

interface UploadAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onAssetUploaded?: (asset: any) => void
  initialData?: any
  isEditing?: boolean
}

export function UploadAssetModal({ isOpen, onClose, onAssetUploaded, initialData, isEditing = false }: UploadAssetModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'IMAGE',
    url: initialData?.url || '',
    description: initialData?.description || '',
    tags: initialData?.tags?.join(', ') || '',
    collection: initialData?.collection || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const tagsArray = formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean)

      const assetData = {
        name: formData.name,
        type: formData.type,
        url: formData.url,
        description: formData.description || null,
        tags: tagsArray,
        collection: formData.collection || null
      }

      // Call the callback to add the asset to the parent component's state
      if (onAssetUploaded) {
        onAssetUploaded(assetData)
      }

      onClose()
      setFormData({
        name: '',
        type: 'IMAGE',
        url: '',
        description: '',
        tags: '',
        collection: ''
      })
    } catch (error) {
      console.error('Failed to upload asset:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Asset" : "Upload Asset"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Asset Name"
            placeholder="e.g., Summer Campaign Hero Image"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { value: 'IMAGE', label: 'Image' },
              { value: 'VIDEO', label: 'Video' },
              { value: 'DOCUMENT', label: 'Document' },
              { value: 'PRESENTATION', label: 'Presentation' },
              { value: 'GUIDE', label: 'Guide' },
              { value: 'CERTIFICATE', label: 'Certificate' }
            ]}
          />
        </div>

        <Input
          label="Asset URL"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          required
        />

        <div className="p-4 border-2 border-dashed border-gray-300 rounded-md text-center">
          <Upload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">
            Drag and drop files or click to browse
          </p>
          <p className="text-xs text-gray-500">
            (File upload integration coming soon)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Collection"
            placeholder="e.g., Summer 2024"
            value={formData.collection}
            onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
          />

          <Input
            label="Tags"
            placeholder="campaign, summer, hero (comma-separated)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
        </div>

        <Textarea
          label="Description"
          placeholder="Describe this asset..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="flex justify-end gap-3 pt-6 mt-2">
          <Button type="button" variant="outline" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.name || !formData.url} className="px-6">
            {loading ? (isEditing ? 'Saving...' : 'Uploading...') : (isEditing ? 'Save Changes' : 'Upload Asset')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
