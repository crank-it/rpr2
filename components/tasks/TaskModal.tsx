'use client'

import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

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
  const [priority, setPriority] = useState('MEDIUM')
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
        setPriority(initialData.priority || 'MEDIUM')
        setTargetDate(initialData.targetDate || '')
        setAssigneeIds(initialData.assigneeIds || [])
        setAttachment(initialData.attachment || '')
      } else {
        // Reset form
        setTitle('')
        setDetails('')
        setStatus('DRAFT')
        setPriority('MEDIUM')
        setTargetDate('')
        setAssigneeIds([])
        setAttachment('')
      }
    }
  }, [isOpen, initialData])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        // Filter only active users
        const activeUsers = data.users?.filter((u: any) => u.status === 'active') || []
        setUsers(activeUsers)
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
        priority,
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

  const toggleAssignee = (userId: string) => {
    if (assigneeIds.includes(userId)) {
      setAssigneeIds(assigneeIds.filter(id => id !== userId))
    } else {
      setAssigneeIds([...assigneeIds, userId])
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

        <div className="grid grid-cols-2 gap-4">
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

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'URGENT', label: 'Urgent' }
            ]}
            required
          />
        </div>

        <Input
          label="Due Date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Assign To
          </label>
          <div className="rounded-xl border border-input bg-background p-3 space-y-1">
            {users.map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-3 py-2 cursor-pointer hover:bg-muted/50 rounded px-2 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={assigneeIds.includes(user.id)}
                  onChange={() => toggleAssignee(user.id)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">{user.name || user.email}</span>
              </label>
            ))}
            {users.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">No active users available</p>
            )}
          </div>
        </div>

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
