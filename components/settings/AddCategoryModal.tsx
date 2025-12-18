'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#64748b', // slate
]

export function AddCategoryModal({ isOpen, onClose, onSuccess }: AddCategoryModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() && (!description.trim())) {
      setError('Category name and description are required')
      return
    } else if (!name.trim()){
      setError('Name is required')
      return
    } else if (!description.trim()) {
      setError('Description is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/project-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          color
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create category')
      }

      // Reset form and close
      setName('')
      setDescription('')
      setColor(COLORS[0])
      onSuccess()
      onClose()
    } catch (err) {
      setError('Failed to create category. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setColor(COLORS[0])
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-card w-full max-w-md mx-4 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-xl font-normal text-foreground">
            New Category
          </h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Name
            </label>
            <input
              type="text"
              placeholder="e.g., Recruitment & Hiring, SEO Projects"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {/* Description <span className="text-muted-foreground font-normal">(optional)</span> */}
              Description
            </label>
            <input
              type="text"
              placeholder="Brief description of this category"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Color
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full transition-all ${
                    color === c && COLORS.includes(color)
                      ? 'ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              {/* Custom color picker */}
              <label
                className={`relative h-8 w-8 rounded-full cursor-pointer transition-all ${
                  !COLORS.includes(color)
                    ? 'ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] pointer-events-none ransition-none">
                  +
                </span>
              </label>
            </div>
            {!COLORS.includes(color) && (
              <p className="mt-2 text-xs text-muted-foreground">
                Custom: {color.toUpperCase()}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
