'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface LinkInput {
  id: string
  title: string
  url: string
  linkType: string
}

export default function NewSystemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    status: 'Draft',
    description: ''
  })
  const [links, setLinks] = useState<LinkInput[]>([])
  const [userIds, setUserIds] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.category) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)

      const payload = {
        ...formData,
        links: links.filter(link => link.title && link.url),
        userIds: userIds.split(',').map(id => id.trim()).filter(Boolean)
      }

      const response = await fetch('/api/systems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/systems/${data.id}`)
      } else {
        const error = await response.json()
        alert(`Failed to create system: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to create system:', error)
      alert('Failed to create system')
    } finally {
      setLoading(false)
    }
  }

  const addLink = () => {
    setLinks([...links, {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      url: '',
      linkType: 'external'
    }])
  }

  const updateLink = (id: string, field: keyof LinkInput, value: string) => {
    setLinks(links.map(link =>
      link.id === id ? { ...link, [field]: value } : link
    ))
  }

  const removeLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id))
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/systems">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Systems
          </Button>
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Create New System</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Document a business system, SOP, or process
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Sales, Operations, HR"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
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
            </div>
          </div>
        </Card>

        {/* Links & Resources */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium">Links & Resources</h3>
            <Button type="button" size="sm" onClick={addLink}>
              <Plus className="mr-2 h-4 w-4" />
              Add Link
            </Button>
          </div>

          {links.length > 0 ? (
            <div className="space-y-3">
              {links.map((link) => (
                <div key={link.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                      placeholder="Link title"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLink(link.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    <select
                      value={link.linkType}
                      onChange={(e) => updateLink(link.id, 'linkType', e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="external">External Link</option>
                      <option value="document">Document</option>
                      <option value="video">Video</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No links added yet. Click "Add Link" to add resources.
            </p>
          )}
        </Card>

        {/* Initial Assignments */}
        <Card className="p-6">
          <h3 className="text-base font-medium mb-4">Initial Assignments</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              User IDs (comma-separated)
            </label>
            <input
              type="text"
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              placeholder="e.g., user1, user2, user3"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Users will be assigned and notified when the system is created
            </p>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create System'}
          </Button>
          <Link href="/systems">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
