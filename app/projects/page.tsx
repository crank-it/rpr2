'use client'

import { Plus, Search, Filter, FolderOpen, Calendar, Pencil, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Project {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  customerId: string | null
  createdAt: string
  customer?: {
    id: string
    name: string
    type: string
  } | null
}

interface Customer {
  id: string
  name: string
}

const getStatusVariant = (status: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
    'IN_PROGRESS': 'default',
    'REVIEW': 'warning',
    'APPROVED': 'success',
    'DRAFT': 'secondary',
    'COMPLETED': 'success'
  }
  return variants[status] || 'secondary'
}

const getPriorityVariant = (priority: string) => {
  const variants: Record<string, 'destructive' | 'warning' | 'secondary'> = {
    'HIGH': 'destructive',
    'MEDIUM': 'warning',
    'LOW': 'secondary'
  }
  return variants[priority] || 'secondary'
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = async () => {
    setLoading(true)

    try {
      const [projectsRes, customersRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/customers')
      ])

      if (!projectsRes.ok) {
        throw new Error('Failed to fetch projects')
      }
      const projectsData = await projectsRes.json()
      setProjects(projectsData)

      if (!customersRes.ok) {
        throw new Error('Failed to fetch customers')
      }
      const customersData = await customersRes.json()
      setCustomers(customersData)
    } catch (error) {
      console.error('Error fetching data:', error)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleProjectCreated = async (newProject: any) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProject.title || newProject.name,
          description: newProject.description || null,
          status: newProject.status || 'DRAFT',
          priority: newProject.priority || 'MEDIUM',
          dueDate: newProject.dueDate || newProject.due_date || null,
          customerId: newProject.customerId || newProject.customer_id || null
        })
      })
      if (!response.ok) {
        throw new Error('Failed to create project')
      }
      const data = await response.json()
      setProjects([data, ...projects])
    } catch (error) {
      console.error('Error creating project:', error)
    }
    setIsCreateModalOpen(false)
  }

  const handleProjectUpdated = async (updatedProject: any) => {
    if (!editingProject) return

    try {
      const response = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updatedProject.title || updatedProject.name,
          description: updatedProject.description,
          status: updatedProject.status,
          priority: updatedProject.priority,
          dueDate: updatedProject.dueDate || updatedProject.due_date,
          customerId: updatedProject.customerId || updatedProject.customer_id
        })
      })
      if (!response.ok) {
        throw new Error('Failed to update project')
      }
      const data = await response.json()
      setProjects(projects.map(p => p.id === editingProject.id ? data : p))
    } catch (error) {
      console.error('Error updating project:', error)
    }
    setEditingProject(null)
  }

  const handleEditClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingProject(project)
  }

  const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteProject(project)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteProject) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects/${deleteProject.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error('Failed to delete project')
      }
      setProjects(projects.filter(p => p.id !== deleteProject.id))
    } catch (error) {
      console.error('Error deleting project:', error)
    } finally {
      setIsDeleting(false)
      setDeleteProject(null)
    }
  }

  const getCustomerName = (project: Project) => {
    if (project.customer?.name) return project.customer.name
    if (!project.customerId) return null
    const customer = customers.find(c => c.id === project.customerId)
    return customer?.name || null
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Manage your projects and workflows
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search projects..."
              className="!pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </Card>

      {/* Projects Table */}
      {loading ? (
        <Card className="p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading projects...</p>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
              <FolderOpen className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {searchQuery ? 'Try a different search term' : 'Get started by creating your first project.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const customerName = getCustomerName(project)
                return (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link
                        href={`/projects/${project.id}`}
                        className="block hover:underline"
                      >
                        <div className="font-medium">{project.title}</div>
                        {project.description && (
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {project.description}
                          </div>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {customerName ? (
                          <>
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                              {customerName.charAt(0)}
                            </div>
                            <span className="text-sm">{customerName}</span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(project.priority)}>
                        {project.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {project.dueDate ? formatDate(project.dueDate) : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEditClick(project, e)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteClick(project, e)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
        customers={customers}
      />

      {editingProject && (
        <CreateProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          onProjectCreated={handleProjectUpdated}
          customers={customers}
          initialData={editingProject}
          isEditing={true}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteProject(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Delete Project</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-medium">&quot;{deleteProject.title}&quot;</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteProject(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
