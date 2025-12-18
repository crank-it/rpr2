'use client'

import { useState, useRef } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Upload, X, FileIcon, ImageIcon, VideoIcon, FileTextIcon } from 'lucide-react'

interface UploadAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onAssetUploaded?: (asset: any) => void
  initialData?: any
  isEditing?: boolean
}

export function UploadAssetModal({ isOpen, onClose, onAssetUploaded, initialData, isEditing = false }: UploadAssetModalProps) {
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'IMAGE',
    description: initialData?.description || '',
    tags: initialData?.tags?.join(', ') || '',
    collection: initialData?.collection || ''
  })

  const detectFileType = (file: File): string => {
    const mimeType = file.type.toLowerCase()
    if (mimeType.startsWith('image/')) return 'IMAGE'
    if (mimeType.startsWith('video/')) return 'VIDEO'
    if (mimeType === 'application/pdf') return 'PDF'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PRESENTATION'
    if (mimeType.includes('document') || mimeType.includes('word')) return 'DOCUMENT'
    return 'DOCUMENT'
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)

      // Auto-fill name if empty
      if (!formData.name) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '')
        setFormData(prev => ({ ...prev, name: nameWithoutExtension }))
      }

      // Auto-detect type
      const detectedType = detectFileType(file)
      setFormData(prev => ({ ...prev, type: detectedType }))

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreviewUrl(null)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)

      if (!formData.name) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '')
        setFormData(prev => ({ ...prev, name: nameWithoutExtension }))
      }

      const detectedType = detectFileType(file)
      setFormData(prev => ({ ...prev, type: detectedType }))

      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreviewUrl(null)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreviewUrl(initialData?.url || null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <ImageIcon className="h-8 w-8 text-blue-500" />
      case 'VIDEO':
        return <VideoIcon className="h-8 w-8 text-purple-500" />
      case 'PDF':
      case 'DOCUMENT':
        return <FileTextIcon className="h-8 w-8 text-red-500" />
      default:
        return <FileIcon className="h-8 w-8 text-muted-foreground" />
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Keep existing URL when editing without uploading a new file
      let fileUrl = isEditing && initialData?.url ? initialData.url : ''

      // Upload file if selected
      if (selectedFile) {
        setUploadProgress('Uploading file...')

        const uploadFormData = new FormData()
        uploadFormData.append('file', selectedFile)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.details || 'Failed to upload file')
        }

        const uploadResult = await uploadResponse.json()
        fileUrl = uploadResult.url
        setUploadProgress('File uploaded successfully!')
      }

      const tagsArray = formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean)

      const assetData = {
        name: formData.name,
        type: formData.type,
        url: fileUrl,
        description: formData.description || null,
        tags: tagsArray,
        collection: formData.collection || null
      }

      // Call the callback to add the asset to the parent component's state
      if (onAssetUploaded) {
        onAssetUploaded(assetData)
      }

      onClose()
      // Reset form
      setFormData({
        name: '',
        type: 'IMAGE',
        description: '',
        tags: '',
        collection: ''
      })
      setSelectedFile(null)
      setPreviewUrl(null)
      setUploadProgress(null)
    } catch (error) {
      console.error('Failed to upload asset:', error)
      setUploadProgress(`Error: ${error instanceof Error ? error.message : 'Upload failed'}`)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = formData.name && formData.description && (selectedFile || isEditing)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Asset" : "Upload Asset"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`relative p-6 border-2 border-dashed rounded-lg text-center transition-colors ${
            selectedFile ? 'border-green-400 bg-green-500/10' : 'border-border hover:border-muted-foreground'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileSelect}
            accept="image/*,video/*,application/pdf,.doc,.docx,.ppt,.pptx"
          />

          {selectedFile ? (
            <div className="flex items-center justify-center gap-4">
              {previewUrl && formData.type === 'IMAGE' ? (
                <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded" />
              ) : (
                getFileIcon(formData.type)
              )}
              <div className="text-left">
                <p className="font-medium text-sm truncate max-w-[200px]">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : isEditing && previewUrl ? (
            <div className="flex flex-col items-center gap-3">
              {formData.type === 'IMAGE' ? (
                <img src={previewUrl} alt="Current" className="h-24 w-auto object-contain rounded" />
              ) : (
                getFileIcon(formData.type)
              )}
              <p className="text-sm text-muted-foreground">Current file</p>
              <p className="text-xs text-muted-foreground">
                Click or drag to replace with a new file
              </p>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground mb-1">
                Drag and drop your file here
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse (Images, Videos, PDFs, Documents)
              </p>
            </>
          )}
        </div>

        {uploadProgress && (
          <div className={`text-sm p-3 rounded ${
            uploadProgress.startsWith('Error') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
          }`}>
            {uploadProgress}
          </div>
        )}

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
              { value: 'PDF', label: 'PDF' },
              { value: 'DOCUMENT', label: 'Document' },
              { value: 'PRESENTATION', label: 'Presentation' },
              { value: 'GUIDE', label: 'Guide' },
              { value: 'CERTIFICATE', label: 'Certificate' }
            ]}
          />
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
          required
        />

        <div className="flex justify-end gap-3 pt-6 mt-2">
          <Button type="button" variant="outline" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !canSubmit} className="px-6">
            {loading ? (isEditing ? 'Saving...' : 'Uploading...') : (isEditing ? 'Save Changes' : 'Upload Asset')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
