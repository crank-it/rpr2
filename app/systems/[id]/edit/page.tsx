'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface System {
  id: string
  title: string
  category: string
  status: string
  description: string | null
  version: number
}

// Predefined categories for business systems
const SYSTEM_CATEGORIES = [
  'Sales & Marketing',
  'Customer Service',
  'Operations',
  'File Management',
  'Communication',
  'Product',
  'Finance & Accounting',
  'Human Resources',
  'Training & Development',
  'Inventory Management',
  'Quality Control',
  'Compliance & Safety'
]

export default function EditSystemPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [system, setSystem] = useState<System | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    status: 'Draft',
    description: ''
  })

  useEffect(() => {
    fetchSystem()
  }, [params.id])

  const fetchSystem = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/systems/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setSystem(data)
        setFormData({
          title: data.title,
          category: data.category,
          status: data.status,
          description: data.description || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch system:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.category) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`/api/systems/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push(`/systems/${params.id}`)
      } else {
        const error = await response.json()
        alert(`Failed to update system: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to update system:', error)
      alert('Failed to update system')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this system? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/systems/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/systems')
      } else {
        const error = await response.json()
        alert(`Failed to delete system: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to delete system:', error)
      alert('Failed to delete system')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-solid border-gray-900 border-r-transparent rounded-full" />
      </div>
    )
  }

  if (!system) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">System not found</p>
          <Link href="/systems">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Systems
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href={`/systems/${params.id}`}>
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to System
          </Button>
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Edit System</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update system details (v{system.version})
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-base font-medium mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Client Onboarding Process"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Changing the title will increment the version and require re-acknowledgement
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select category</option>
                  {SYSTEM_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Draft">Draft</option>
                  <option value="Start">Start</option>
                  <option value="Approve">Approve</option>
                  <option value="Need Review">Need Review</option>
                </select>
                {system.status === 'Draft' && formData.status !== 'Draft' && (
                  <p className="text-xs text-amber-600 mt-1">
                    Changing from Draft will increment the version
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the purpose and scope of this system..."
                className="w-full px-3 py-2 border rounded-lg text-sm min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Changing the description will increment the version and require re-acknowledgement
              </p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link href={`/systems/${params.id}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete System
          </Button>
        </div>
      </form>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Links, assignments, and comments are managed on the system detail page.
          Use the tabs on the detail view to add or remove these items.
        </p>
      </Card>
    </div>
  )
}
