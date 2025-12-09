'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

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
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'DRAFT',
    priority: initialData?.priority || 'MEDIUM',
    customerId: initialData?.customerId || initialData?.customer?.id || '',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const selectedCustomer = customers.find(c => c.id === formData.customerId)

      const projectData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: new Date(formData.dueDate).toISOString(),
        customerId: formData.customerId,
        customer: selectedCustomer
      }

      // Call the callback to add the project to the parent component's state
      if (onProjectCreated) {
        onProjectCreated(projectData)
      }

      onClose()
      setFormData({
        title: '',
        description: '',
        status: 'DRAFT',
        priority: 'MEDIUM',
        customerId: '',
        dueDate: ''
      })
    } catch (error) {
      console.error('Failed to create project:', error)
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

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'DRAFT', label: 'Draft' },
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
            required
          />

          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-2">
          <Button type="button" variant="outline" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.title || !formData.description || !formData.customerId || !formData.dueDate} className="px-6">
            {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Project')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
