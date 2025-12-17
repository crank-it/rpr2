'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, ExternalLink } from 'lucide-react'
import { CommentThread } from '@/components/comments/CommentThread'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { TaskModal } from '@/components/tasks/TaskModal'
import { UserAvatar } from '@/components/common/UserAvatar'
import { formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface Customer {
  id: string
  name: string
  type: string
}

interface Project {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  customerId: string | null
  owner: string | null
  assignees: string[]
  categoryIds: string[]
  assets: Array<{ label: string; url: string }>
  customFieldValues?: Record<string, string | string[]>
  createdAt: string
  updatedAt: string
  completedAt: string | null
  customer?: Customer | null
}

const formatStatus = (status: string) => {
  return status.replace('_', ' ').charAt(0) + status.replace('_', ' ').slice(1).toLowerCase()
}

const getTaskAssigneeNames = (assigneeIds: string[], users: Array<{ id: string; name: string }>) => {
  if (!assigneeIds || assigneeIds.length === 0) return 'Unassigned'
  const names = assigneeIds
    .map(id => users.find(u => u.id === id)?.name)
    .filter(Boolean)
  if (names.length === 0) return 'Unassigned'
  if (names.length <= 2) return names.join(', ')
  return `${names[0]}, ${names[1]} +${names.length - 2}`
}

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)

  const fetchProject = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)

        // Fetch categories if project has them (with custom fields for field name lookup)
        if (data.categoryIds && data.categoryIds.length > 0) {
          const categoriesRes = await fetch('/api/project-categories')
          if (categoriesRes.ok) {
            const allCategories = await categoriesRes.json()
            const projectCategories = allCategories.filter((c: any) =>
              data.categoryIds.includes(c.id)
            )
            setCategories(projectCategories)
          }
        }

        // Fetch tasks
        const tasksRes = await fetch(`/api/tasks?projectId=${projectId}`)
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json()
          setTasks(tasksData)
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    }
    setLoading(false)
  }

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('id, name, type')
      .order('name')
    setCustomers(data || [])
  }

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('status', 'active')
      .order('name')
    if (data) {
      setUsers(data.map(u => ({ id: u.id, name: u.name || u.email || 'Unknown' })))
    }
  }

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0)

    fetchProject()
    fetchCustomers()
    fetchUsers()
  }, [projectId])

  const handleProjectUpdated = async () => {
    await fetchProject()
    setIsEditModalOpen(false)
  }

  const handleSaveTask = async (taskData: any) => {
    try {
      if (editingTask) {
        // Update existing task
        const response = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        })

        if (response.ok) {
          await fetchProject()
          setEditingTask(null)
        }
      } else {
        // Create new task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        })

        if (response.ok) {
          await fetchProject()
        }
      }
    } catch (error) {
      console.error('Failed to save task:', error)
    }
  }

  const handleEditTask = (task: any) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false)
    setEditingTask(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-6 w-6 border-2 border-solid border-foreground border-r-transparent rounded-full" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-8">Project not found</p>
            <Link href="/projects" className="text-sm text-primary hover:text-primary/80 transition-colors">
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* Back button */}
        <Link
          href="/projects"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-12 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-3">
            <h1 className="text-5xl font-normal text-foreground tracking-tight">
              {project.title}
            </h1>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="h-5 w-5" />
            </button>
          </div>
          {project.description && (
            <div
              className="text-sm text-muted-foreground prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          )}
        </div>

        {/* Project Details */}
        <div className="mb-12">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Details
          </h2>
          <div className="rounded-xl border border-border bg-card p-6 space-y-0">
            {/* Status */}
            <div className="py-4">
              <div className="flex items-baseline justify-between gap-8">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-foreground mb-1">
                    Status
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatStatus(project.status)}
                  </p>
                </div>
              </div>
            </div>
            <div className="h-px bg-border" />

            {/* Priority */}
            <div className="py-4">
              <div className="flex items-baseline justify-between gap-8">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-foreground mb-1">
                    Priority
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {project.priority.charAt(0) + project.priority.slice(1).toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
            <div className="h-px bg-border" />

            {/* Customer */}
            <div className="py-4">
              <div className="flex items-baseline justify-between gap-8">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-foreground mb-1">
                    Customer
                  </h3>
                  {project.customer ? (
                    <Link
                      href={`/customers/${project.customer.id}`}
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      {project.customer.name}
                    </Link>
                  ) : (
                    <p className="text-sm text-muted-foreground">No customer assigned</p>
                  )}
                </div>
              </div>
            </div>
            <div className="h-px bg-border" />

            {/* Due Date */}
            <div className="py-4">
              <div className="flex items-baseline justify-between gap-8">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-foreground mb-1">
                    Due Date
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {project.dueDate ? formatDate(project.dueDate) : 'No due date'}
                  </p>
                </div>
              </div>
            </div>

            {/* Assignees */}
            {project.assignees && project.assignees.length > 0 && (
              <>
                <div className="h-px bg-border" />
                <div className="py-4">
                  <div className="flex items-baseline justify-between gap-8">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-foreground mb-3">
                        Assignees
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {project.assignees.map((userId) => (
                          <UserAvatar key={userId} userId={userId} size="md" showName />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <>
                <div className="h-px bg-border" />
                <div className="py-4">
                  <div className="flex items-baseline justify-between gap-8">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-foreground mb-3">
                        Categories
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-sm text-foreground">{category.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Custom Fields */}
            {project.customFieldValues && Object.keys(project.customFieldValues).length > 0 && (
              <>
                <div className="h-px bg-border" />
                <div className="py-4">
                  <h3 className="text-base font-medium text-foreground mb-3">
                    Custom Fields
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(project.customFieldValues).map(([fieldId, value]) => {
                      // Look up field definition to get name and type
                      const fieldDef = categories
                        .flatMap((c: any) => c.customFields || [])
                        .find((f: any) => f.id === fieldId)

                      if (!fieldDef) return null

                      // Format display value based on field type
                      let displayValue: React.ReactNode = value

                      if (fieldDef.type === 'checkbox') {
                        displayValue = value === 'true' ? 'Yes' : 'No'
                      } else if (fieldDef.type === 'date') {
                        displayValue = value ? formatDate(value as string) : ''
                      } else if (fieldDef.type === 'url') {
                        displayValue = value ? (
                          <a
                            href={value as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                          >
                            {value as string}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : ''
                      } else if (fieldDef.type === 'user') {
                        const user = users.find(u => u.id === value)
                        displayValue = user?.name || value
                      } else if (fieldDef.type === 'multiselect') {
                        displayValue = Array.isArray(value) ? value.join(', ') : value
                      } else {
                        displayValue = Array.isArray(value) ? value.join(', ') : value
                      }

                      return (
                        <div key={fieldId} className="flex gap-3">
                          <span className="text-sm font-medium text-muted-foreground min-w-[120px]">
                            {fieldDef.name}:
                          </span>
                          <span className="text-sm text-foreground">{displayValue}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reference Links */}
        {project.assets && project.assets.length > 0 && (
          <div className="mb-12">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Reference Links
            </h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-0">
              {project.assets.map((asset, index) => (
                <div key={index}>
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-4 transition-opacity hover:opacity-60"
                  >
                    <div className="flex items-baseline justify-between gap-8">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-foreground mb-1">
                          {asset.label || 'Link'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ExternalLink className="h-3 w-3" />
                          <span className="truncate">{asset.url}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                  {index < project.assets.length - 1 && <div className="h-px bg-border" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Tasks
            </h2>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              + Add Task
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No tasks yet
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-0">
                {tasks.map((task, index) => (
                  <div key={task.id}>
                    <button
                      onClick={() => handleEditTask(task)}
                      className="w-full text-left py-4 transition-opacity hover:opacity-60"
                    >
                      <div className="flex items-baseline justify-between gap-8">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-foreground mb-1">
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{getTaskAssigneeNames(task.assigneeIds || [], users)}</span>
                            <span>·</span>
                            <span>{formatStatus(task.status)}</span>
                            <span>·</span>
                            <span>{task.targetDate ? formatDate(task.targetDate) : 'No due date'}</span>
                            {task.priority && (
                              <>
                                <span>·</span>
                                <span>{task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}</span>
                              </>
                            )}
                            {task.attachment && (
                              <>
                                <span>·</span>
                                <span className="text-primary">Attachment</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                    {index < tasks.length - 1 && <div className="h-px bg-border" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="mb-12">
          <CommentThread entityType="PROJECT" entityId={project.id} />
        </div>

        <CreateProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onProjectCreated={handleProjectUpdated}
          customers={customers}
          initialData={project}
          isEditing={true}
        />

        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={handleCloseTaskModal}
          onSave={handleSaveTask}
          projectId={projectId}
          initialData={editingTask}
        />
      </div>
    </div>
  )
}
