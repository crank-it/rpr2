'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { MultiSelect } from '@/components/ui/multi-select'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated?: (project: any) => void
  customers?: { id: string; name: string; type?: string }[]
  initialData?: any
  isEditing?: boolean
}

export function CreateProjectModal({ isOpen, onClose, onProjectCreated, customers = [], initialData, isEditing = false }: CreateProjectModalProps) {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string; customFields?: any[] }>>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialData?.categoryIds?.[0] || '')
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | string[]>>(initialData?.customFieldValues || {})
  const [categoryCustomFields, setCategoryCustomFields] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'DRAFT',
    priority: initialData?.priority || 'MEDIUM',
    customerId: initialData?.customerId || initialData?.customer?.id || '',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
    assignees: initialData?.assignees || [],
    assets: initialData?.assets || []
  })

  // Fetch users and categories
  useEffect(() => {
    async function fetchData() {
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

        // Fetch categories
        const categoriesRes = await fetch('/api/project-categories')
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData.map((c: any) => ({ id: c.id, name: c.name, customFields: c.customFields })))
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }

    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  // Fetch custom fields when category selected
  useEffect(() => {
    async function fetchCategoryFields() {
      if (selectedCategoryId) {
        const response = await fetch(`/api/project-categories/${selectedCategoryId}`)
        if (response.ok) {
          const data = await response.json()
          setCategoryCustomFields(data.customFields || [])
        }
      } else {
        setCategoryCustomFields([])
      }
    }

    fetchCategoryFields()
  }, [selectedCategoryId])

  const addAsset = () => {
    setFormData({
      ...formData,
      assets: [...formData.assets, { label: '', url: '' }]
    })
  }

  const removeAsset = (index: number) => {
    setFormData({
      ...formData,
      assets: formData.assets.filter((_: any, i: number) => i !== index)
    })
  }

  const updateAsset = (index: number, field: 'label' | 'url', value: string) => {
    const newAssets = [...formData.assets]
    newAssets[index][field] = value
    setFormData({ ...formData, assets: newAssets })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: new Date(formData.dueDate).toISOString(),
        customerId: formData.customerId || null,
        assignees: formData.assignees,
        categoryIds: selectedCategoryId ? [selectedCategoryId] : [],
        assets: formData.assets.filter((a: any) => a.url), // Only include assets with URLs
        customFieldValues: customFieldValues
      }

      const url = isEditing && initialData?.id
        ? `/api/projects/${initialData.id}`
        : '/api/projects'

      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      })

      if (!response.ok) {
        throw new Error('Failed to save project')
      }

      const project = await response.json()

      if (onProjectCreated) {
        onProjectCreated(project)
      }

      onClose()
      setFormData({
        title: '',
        description: '',
        status: 'DRAFT',
        priority: 'MEDIUM',
        customerId: '',
        dueDate: '',
        assignees: [],
        assets: []
      })
      setSelectedCategoryId('')
      setCustomFieldValues({})
    } catch (error) {
      console.error('Failed to save project:', error)
      alert('Failed to save project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Project" : "Create New Project"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Project Title"
          placeholder="e.g., Summer Campaign 2024"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <Textarea
          label="Description"
          placeholder="Describe the project objectives and deliverables..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />

        <Select
          label="Project Type"
          value={selectedCategoryId}
          onChange={(e) => {
            setSelectedCategoryId(e.target.value)
            setCustomFieldValues({}) // Reset custom values when type changes
          }}
          options={[
            { value: '', label: 'Select project type...' },
            ...categories.map(c => ({ value: c.id, label: c.name }))
          ]}
          required
        />

        {categoryCustomFields.length > 0 && (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h3 className="text-sm font-medium text-foreground">Custom Fields</h3>

            {categoryCustomFields.map((field) => {
              // Text input
              if (field.type === 'text') {
                return (
                  <Input
                    key={field.id}
                    label={field.name}
                    value={(customFieldValues[field.id] as string) || ''}
                    onChange={(e) => setCustomFieldValues({
                      ...customFieldValues,
                      [field.id]: e.target.value
                    })}
                    required={field.required}
                  />
                )
              }

              // Textarea
              if (field.type === 'textarea') {
                return (
                  <Textarea
                    key={field.id}
                    label={field.name}
                    value={(customFieldValues[field.id] as string) || ''}
                    onChange={(e) => setCustomFieldValues({
                      ...customFieldValues,
                      [field.id]: e.target.value
                    })}
                    required={field.required}
                  />
                )
              }

              // Number input
              if (field.type === 'number') {
                return (
                  <Input
                    key={field.id}
                    type="number"
                    label={field.name}
                    value={(customFieldValues[field.id] as string) || ''}
                    onChange={(e) => setCustomFieldValues({
                      ...customFieldValues,
                      [field.id]: e.target.value
                    })}
                    required={field.required}
                  />
                )
              }

              // Email input
              if (field.type === 'email') {
                return (
                  <Input
                    key={field.id}
                    type="email"
                    label={field.name}
                    value={(customFieldValues[field.id] as string) || ''}
                    onChange={(e) => setCustomFieldValues({
                      ...customFieldValues,
                      [field.id]: e.target.value
                    })}
                    required={field.required}
                  />
                )
              }

              // URL input
              if (field.type === 'url') {
                return (
                  <Input
                    key={field.id}
                    type="url"
                    label={field.name}
                    placeholder="https://"
                    value={(customFieldValues[field.id] as string) || ''}
                    onChange={(e) => setCustomFieldValues({
                      ...customFieldValues,
                      [field.id]: e.target.value
                    })}
                    required={field.required}
                  />
                )
              }

              // Date input
              if (field.type === 'date') {
                return (
                  <Input
                    key={field.id}
                    type="date"
                    label={field.name}
                    value={(customFieldValues[field.id] as string) || ''}
                    onChange={(e) => setCustomFieldValues({
                      ...customFieldValues,
                      [field.id]: e.target.value
                    })}
                    required={field.required}
                  />
                )
              }

              // User selector (Person Responsible)
              if (field.type === 'user') {
                return (
                  <Select
                    key={field.id}
                    label={field.name}
                    value={(customFieldValues[field.id] as string) || ''}
                    onChange={(e) => setCustomFieldValues({
                      ...customFieldValues,
                      [field.id]: e.target.value
                    })}
                    options={[
                      { value: '', label: 'Select person...' },
                      ...users.map(u => ({ value: u.id, label: u.name }))
                    ]}
                    required={field.required}
                  />
                )
              }

              // Checkbox
              if (field.type === 'checkbox') {
                return (
                  <div key={field.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`checkbox-${field.id}`}
                      checked={(customFieldValues[field.id] as string) === 'true'}
                      onChange={(e) => setCustomFieldValues({
                        ...customFieldValues,
                        [field.id]: e.target.checked ? 'true' : 'false'
                      })}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor={`checkbox-${field.id}`} className="text-sm font-medium text-foreground">
                      {field.name}
                    </label>
                  </div>
                )
              }

              // Dropdown
              if (field.type === 'dropdown') {
                return (
                  <Select
                    key={field.id}
                    label={field.name}
                    value={(customFieldValues[field.id] as string) || ''}
                    onChange={(e) => setCustomFieldValues({
                      ...customFieldValues,
                      [field.id]: e.target.value
                    })}
                    options={[
                      { value: '', label: 'Select...' },
                      ...(field.options || []).map((opt: string) => ({ value: opt, label: opt }))
                    ]}
                    required={field.required}
                  />
                )
              }

              // Multi-select
              if (field.type === 'multiselect') {
                return (
                  <MultiSelect
                    key={field.id}
                    label={field.name}
                    options={(field.options || []).map((opt: string) => ({ value: opt, label: opt }))}
                    value={(customFieldValues[field.id] as string[]) || []}
                    onChange={(value) => setCustomFieldValues({
                      ...customFieldValues,
                      [field.id]: value
                    })}
                    placeholder={`Select ${field.name.toLowerCase()}...`}
                  />
                )
              }

              return null
            })}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'DRAFT', label: 'Draft' },
              { value: 'START', label: 'Start' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'REVIEW', label: 'Review' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'COMPLETED', label: 'Completed' }
            ]}
          />

          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'URGENT', label: 'Urgent' }
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Customer"
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            options={[
              { value: '', label: 'Select customer...' },
              ...customers.map(c => ({ value: c.id, label: c.name }))
            ]}
          />

          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>

        <MultiSelect
          label="Assignees"
          options={users.map(u => ({ value: u.id, label: u.name }))}
          value={formData.assignees}
          onChange={(value) => setFormData({ ...formData, assignees: value })}
          placeholder="Select team members..."
        />


        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            Dropbox Links
          </label>
          {formData.assets.map((asset: any, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Label (e.g., 'Design Files')"
                value={asset.label}
                onChange={(e) => updateAsset(index, 'label', e.target.value)}
              />
              <Input
                placeholder="Dropbox URL"
                value={asset.url}
                onChange={(e) => updateAsset(index, 'url', e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeAsset(index)}
                className="px-3"
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addAsset}
            className="w-full"
          >
            + Add Asset Link
          </Button>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-2">
          <Button type="button" variant="outline" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.title || !formData.description || !formData.dueDate} className="px-6">
            {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Project')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
