'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { MultiSelect } from '@/components/ui/multi-select'

interface LinkInput {
  id: string
  title: string
  url: string
  linkType: string
}

interface User {
  id: string
  name: string
}

export default function NewSystemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    status: 'Draft',
    description: ''
  })
  const [links, setLinks] = useState<LinkInput[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch active users
      const usersRes = await fetch('/api/users')
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        const activeUsers = usersData
          .filter((u: any) => u.status === 'active')
          .map((u: any) => ({ id: u.id, name: u.name || u.email }))
        setUsers(activeUsers)
      }

      // Fetch existing systems to extract unique categories
      const systemsRes = await fetch('/api/systems')
      if (systemsRes.ok) {
        const systemsData = await systemsRes.json()
        const uniqueCategories = Array.from(new Set(systemsData.map((s: any) => s.category)))
        setCategories(uniqueCategories as string[])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

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
        userIds: selectedUserIds
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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12">
          <Link href="/systems">
            <button className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Systems
            </button>
          </Link>
          <h1 className="text-5xl font-normal text-foreground tracking-tight mb-3">
            New System
          </h1>
          <p className="text-sm text-muted-foreground">
            Document a business system, SOP, or process
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Client Onboarding Process"
              className="w-full border-0 border-b border-border bg-transparent py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Category and Status */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border-0 border-b border-border bg-transparent py-3 text-base text-foreground focus:border-primary focus:outline-none transition-colors"
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__new__">+ Add new category</option>
              </select>
              {formData.category === '__new__' && (
                <input
                  type="text"
                  placeholder="Enter new category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border-0 border-b border-border bg-transparent py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors mt-4"
                  autoFocus
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border-0 border-b border-border bg-transparent py-3 text-base text-foreground focus:border-primary focus:outline-none transition-colors"
              >
                <option value="Draft">Draft</option>
                <option value="Start">Start</option>
                <option value="Approve">Approve</option>
                <option value="Need Review">Need Review</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose and scope of this system..."
              className="w-full border border-border rounded-lg bg-transparent px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
              rows={4}
            />
          </div>

          {/* Links & Resources */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-foreground">
                Links & Resources
              </label>
              <button
                type="button"
                onClick={addLink}
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Link
              </button>
            </div>

            {links.length > 0 && (
              <div className="space-y-3">
                {links.map((link) => (
                  <div key={link.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                        placeholder="Link title"
                        className="flex-1 border-0 border-b border-border bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(link.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                        placeholder="https://..."
                        className="flex-1 border-0 border-b border-border bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                      <select
                        value={link.linkType}
                        onChange={(e) => updateLink(link.id, 'linkType', e.target.value)}
                        className="border-0 border-b border-border bg-transparent py-2 text-sm text-foreground focus:border-primary focus:outline-none"
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
            )}
          </div>

          {/* Responsible Team Members */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Responsible Team Members
            </label>
            <p className="text-sm text-muted-foreground mb-4">
              Select team members who need to acknowledge this system
            </p>
            <MultiSelect
              options={users.map(u => ({ value: u.id, label: u.name }))}
              value={selectedUserIds}
              onChange={setSelectedUserIds}
              placeholder="Search and select team members..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-8 border-t border-border">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create System'}
            </button>
            <Link href="/systems">
              <button
                type="button"
                className="px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
