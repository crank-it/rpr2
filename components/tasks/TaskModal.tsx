'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { MultiSelect } from '@/components/ui/multi-select'

interface User {
  id: string
  name: string
  email: string
}

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: any) => void
  projectId: string
  initialData?: any
}

export function TaskModal({ isOpen, onClose, onSave, projectId, initialData }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [status, setStatus] = useState('DRAFT')
  const [targetDate, setTargetDate] = useState('')
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])
  const [attachment, setAttachment] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      if (initialData) {
        setTitle(initialData.title || '')
        setDetails(initialData.details || '')
        setStatus(initialData.status || 'DRAFT')
        setTargetDate(initialData.targetDate || '')
        setAssigneeIds(initialData.assigneeIds || [])
        setAttachment(initialData.attachment || '')
      } else {
        // Reset form
        setTitle('')
        setDetails('')
        setStatus('DRAFT')
        setTargetDate('')
        setAssigneeIds([])
        setAttachment('')
      }
    }
  }, [isOpen, initialData])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/active')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.map((u: any) => ({ id: u.id, name: u.name || u.email, email: u.email })))
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      const taskData = {
        projectId,
        title,
        details: details || null,
        status,
        targetDate: targetDate || null,
        assigneeIds,
        attachment: attachment || null
      }

      await onSave(taskData)
      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Task' : 'New Task'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title..."
          required
        />

        <Textarea
          label="Details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Add task details..."
        />

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'DRAFT', label: 'Draft' },
            { value: 'START', label: 'Start' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'REVIEW', label: 'Review' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'COMPLETED', label: 'Completed' }
          ]}
          required
        />

        <Input
          label="Due Date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
        />

        <MultiSelect
          label="Assign To"
          options={users.map(u => ({ value: u.id, label: u.name || u.email }))}
          value={assigneeIds}
          onChange={setAssigneeIds}
          placeholder="Select assignees..."
        />

        <Input
          label="Attachment URL"
          type="url"
          value={attachment}
          onChange={(e) => setAttachment(e.target.value)}
          placeholder="https://example.com/file.jpg or https://dropbox.com/..."
        />

        <div className="flex justify-end gap-3 pt-6 mt-2">
          <Button type="button" variant="outline" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim() || loading} className="px-6">
            {loading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
