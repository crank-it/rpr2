'use client'

import { useState, useEffect } from 'react'
import { Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Filters } from '@/components/ui/filters'

interface Task {
  id: string
  projectId: string
  title: string
  details: string | null
  attachment: string | null
  assigneeIds: string[]
  targetDate: string | null
  status: string
  createdAt: string
  updatedAt: string
  completedAt: string | null
  project?: {
    id: string
    title: string
  }
}

const formatStatus = (status: string) => {
  return status.replace('_', ' ').charAt(0) + status.replace('_', ' ').slice(1).toLowerCase()
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: '',
    sortBy: '-updated_at'
  })

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project?.title?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !filterValues.status || task.status === filterValues.status

    return matchesSearch && matchesStatus
  })

  // Apply sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const sortBy = filterValues.sortBy
    if (sortBy === '-updated_at') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    if (sortBy === 'updated_at') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    if (sortBy === '-target_date') {
      if (!a.targetDate) return 1
      if (!b.targetDate) return -1
      return new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime()
    }
    if (sortBy === 'target_date') {
      if (!a.targetDate) return 1
      if (!b.targetDate) return -1
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    }
    if (sortBy === 'title') return a.title.localeCompare(b.title)
    if (sortBy === '-title') return b.title.localeCompare(a.title)
    return 0
  })

  // Group by status
  const groupedTasks = sortedTasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = []
    }
    acc[task.status].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  const statusOrder = ['DRAFT', 'START', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'COMPLETED']
  const sortedStatuses = Object.keys(groupedTasks).sort((a, b) => {
    return statusOrder.indexOf(a) - statusOrder.indexOf(b)
  })

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Start', value: 'START' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Review', value: 'REVIEW' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Completed', value: 'COMPLETED' }
      ]
    },
    {
      key: 'sortBy',
      label: 'Sort By',
      type: 'select' as const,
      options: [
        { label: 'Recently Updated', value: '-updated_at' },
        { label: 'Oldest Updated', value: 'updated_at' },
        { label: 'Due Date (Soonest)', value: 'target_date' },
        { label: 'Due Date (Latest)', value: '-target_date' },
        { label: 'Title (A-Z)', value: 'title' },
        { label: 'Title (Z-A)', value: '-title' }
      ]
    }
  ]

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilterValues({
      status: '',
      sortBy: '-updated_at'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-normal text-foreground tracking-tight mb-3">
            Tasks
          </h1>
          <p className="text-sm text-muted-foreground">
            {sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-16">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              className="w-full border-0 border-b border-border bg-transparent py-3 pl-12 pr-20 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <Filters
                filters={filterConfig}
                values={filterValues}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-foreground border-r-transparent"></div>
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-8">
              {searchQuery ? 'No tasks found' : 'No tasks yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {sortedStatuses.map((status) => (
              <div key={status}>
                {/* Status divider */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {formatStatus(status)}
                  </div>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Tasks in this status */}
                <div className="space-y-0">
                  {groupedTasks[status].map((task, index) => (
                    <div key={task.id}>
                      <Link
                        href={`/projects/${task.projectId}`}
                        className="block py-6 transition-opacity hover:opacity-60"
                      >
                        <div className="flex items-baseline justify-between gap-8">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium text-foreground mb-1">
                              {task.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              {task.project && (
                                <>
                                  <span>{task.project.title}</span>
                                  <span>·</span>
                                </>
                              )}
                              {task.targetDate && (
                                <>
                                  <span>Due {formatDate(task.targetDate)}</span>
                                  <span>·</span>
                                </>
                              )}
                              {task.assigneeIds && task.assigneeIds.length > 0 && (
                                <span>{task.assigneeIds.length} assigned</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                      {index < groupedTasks[status].length - 1 && (
                        <div className="h-px bg-border" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
