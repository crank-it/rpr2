'use client'

import { Plus, Search, Filter, FolderOpen, Calendar, Pencil } from 'lucide-react'
import { useState, useEffect } from 'react'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
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
  name: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  customer_id: string | null
  created_at: string
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

  const fetchData = async () => {
    setLoading(true)

    const [projectsRes, customersRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('customers').select('id, name').order('name')
    ])

    if (projectsRes.error) {
      console.error('Error fetching projects:', projectsRes.error)
    } else {
      setProjects(projectsRes.data || [])
    }

    if (customersRes.error) {
      console.error('Error fetching customers:', customersRes.error)
    } else {
      setCustomers(customersRes.data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleProjectCreated = async (newProject: any) => {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name: newProject.name,
        description: newProject.description || null,
        status: newProject.status || 'DRAFT',
        priority: newProject.priority || 'MEDIUM',
        due_date: newProject.due_date || null,
        customer_id: newProject.customer_id || null
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
    } else if (data) {
      setProjects([data, ...projects])
    }
    setIsCreateModalOpen(false)
  }

  const handleProjectUpdated = async (updatedProject: any) => {
    if (!editingProject) return

    const { data, error } = await supabase
      .from('projects')
      .update({
        name: updatedProject.name,
        description: updatedProject.description,
        status: updatedProject.status,
        priority: updatedProject.priority,
        due_date: updatedProject.due_date,
        customer_id: updatedProject.customer_id
      })
      .eq('id', editingProject.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
    } else if (data) {
      setProjects(projects.map(p => p.id === editingProject.id ? data : p))
    }
    setEditingProject(null)
  }

  const handleEditClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingProject(project)
  }

  const getCustomerName = (customerId: string | null) => {
    if (!customerId) return null
    const customer = customers.find(c => c.id === customerId)
    return customer?.name || null
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search projects..."
              className="pl-9"
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
                const customerName = getCustomerName(project.customer_id)
                return (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link
                        href={`/projects/${project.id}`}
                        className="block hover:underline"
                      >
                        <div className="font-medium">{project.name}</div>
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
                        {project.due_date ? formatDate(project.due_date) : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditClick(project, e)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
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
    </div>
  )
}
