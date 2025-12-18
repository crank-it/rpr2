'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface DeleteCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  categoryName: string
  projectCount: number
}

export function DeleteCategoryModal({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  projectCount
}: DeleteCategoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    setLoading(true)
    setError('')
    try {
      await onConfirm()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to delete category')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const hasProjects = projectCount > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card w-full max-w-md mx-4 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <h2 className="text-xl font-normal text-foreground">
              Delete Category
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          {hasProjects ? (
            <div className="space-y-3">
              <p className="text-foreground">
                Cannot delete <span className="font-medium">{categoryName}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                This category is currently used by {projectCount} {projectCount === 1 ? 'project' : 'projects'}.
                Please remove the category from all projects before deleting.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-foreground">
                Are you sure you want to delete <span className="font-medium">{categoryName}</span>?
              </p>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. The category and all its custom fields will be permanently removed.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {hasProjects ? 'Close' : 'Cancel'}
            </button>
            {!hasProjects && (
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Deleting...' : 'Delete Category'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
