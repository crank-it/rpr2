'use client'

import { Plus, Search, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  customerId: string | null
  createdAt: string
  assignees: string[]
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

interface User {
  id: string
  name: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  const fetchData = async () => {
    setLoading(true)

    try {
      const [projectsRes, customersRes, usersRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/customers'),
        fetch('/api/users/active')
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

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.map((u: any) => ({ id: u.id, name: u.name || u.email })))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleProjectCreated = async (newProject: any) => {
    // The modal already created the project via API, just update local state
    setProjects([newProject, ...projects])
    setIsCreateModalOpen(false)
  }

  const getCustomerName = (project: Project) => {
    if (project.customer?.name) return project.customer.name
    if (!project.customerId) return null
    const customer = customers.find(c => c.id === project.customerId)
    return customer?.name || null
  }

  const getAssigneeNames = (project: Project) => {
    if (!project.assignees || project.assignees.length === 0) return null
    const names = project.assignees
      .map(id => users.find(u => u.id === id)?.name)
      .filter(Boolean)
    if (names.length === 0) return null
    if (names.length <= 2) return names.join(', ')
    return `${names[0]}, ${names[1]} +${names.length - 2}`
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return

    const response = await fetch(`/api/projects/${projectToDelete.id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete project')
    }

    fetchData()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Centered container with max width */}
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* Header - Centered */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-normal text-foreground tracking-tight mb-3">
            Projects
          </h1>
          <p className="text-sm text-muted-foreground">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>

        {/* Search bar - Minimal */}
        <div className="relative mb-16">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            className="w-full border-0 border-b border-border bg-transparent py-3 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-foreground border-r-transparent"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-8">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create your first project
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            {filteredProjects.map((project, index) => {
              const customerName = getCustomerName(project)
              const assigneeNames = getAssigneeNames(project)

              return (
                <div key={project.id} className="group">
                  <div className="flex items-center">
                    <Link
                      href={`/projects/${project.id}`}
                      className="flex-1 py-8 transition-opacity hover:opacity-60"
                    >
                      <div className="flex items-baseline justify-between gap-8">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-foreground mb-1">
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{assigneeNames || 'Unassigned'}</span>
                            <span>·</span>
                            <span>{formatStatus(project.status)}</span>
                            {customerName && (
                              <>
                                <span>·</span>
                                <span>{customerName}</span>
                              </>
                            )}
                            {project.dueDate && (
                              <>
                                <span>·</span>
                                <span>{formatDate(project.dueDate)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => setProjectToDelete(project)}
                      className="p-3 mr-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4 hover:text-[lab(55.4814%_75.0732_48.8528)]" />
                    </button>
                  </div>
                  {index < filteredProjects.length - 1 && (
                    <div className="h-px bg-border" />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Floating action button - bottom right */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft-lg hover:shadow-soft-xl transition-all hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
        customers={customers}
      />

      {/* Delete Project Modal */}
      {projectToDelete && (
        <DeleteConfirmModal
          isOpen={!!projectToDelete}
          onClose={() => setProjectToDelete(null)}
          onConfirm={handleDeleteProject}
          title="Delete Project"
          itemName={projectToDelete.title}
          warningMessage="This action cannot be undone."
          cascadeMessage="All tasks linked to this project will also be deleted."
        />
      )}
    </div>
  )
}
