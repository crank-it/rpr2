'use client'

import { useState, useEffect } from 'react'
import { X, Upload, Link as LinkIcon, Calendar, Users } from 'lucide-react'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background w-full max-w-2xl mx-4 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <h2 className="text-2xl font-normal text-foreground">
            {initialData ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              required
              className="w-full border-0 border-b border-border bg-transparent py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add task details..."
              rows={4}
              className="w-full border border-border bg-transparent rounded-lg p-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border-0 border-b border-border bg-transparent py-3 text-base text-foreground focus:border-primary focus:outline-none transition-colors"
              >
                <option value="DRAFT">Draft</option>
                <option value="START">Start</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="APPROVED">Approved</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border-0 border-b border-border bg-transparent py-3 text-base text-foreground focus:border-primary focus:outline-none transition-colors"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full border-0 border-b border-border bg-transparent py-3 text-base text-foreground focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assign To
            </label>
            <div className="space-y-2">
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
                <p className="text-sm text-muted-foreground">No active users available</p>
              )}
            </div>
          </div>

          {/* Attachment/Link */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Attachment URL
            </label>
            <input
              type="url"
              value={attachment}
              onChange={(e) => setAttachment(e.target.value)}
              placeholder="https://example.com/file.jpg or https://dropbox.com/..."
              className="w-full border-0 border-b border-border bg-transparent py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Add a link to an image or file (Dropbox, Google Drive, etc.)
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
