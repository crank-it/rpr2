'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Pencil } from 'lucide-react'
import { CommentThread } from '@/components/comments/CommentThread'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
  due_date: string | null
  customer_id: string | null
  owner: string | null
  assignees: string[]
  created_at: string
  updated_at: string
  completed_at: string | null
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

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchProject = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
    } else {
      setProject(data)

      // Fetch customer if exists
      if (data?.customer_id) {
        const { data: customerData } = await supabase
          .from('customers')
          .select('id, name, type')
          .eq('id', data.customer_id)
          .single()
        setCustomer(customerData)
      }
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

  useEffect(() => {
    fetchProject()
    fetchCustomers()
  }, [projectId])

  const handleProjectUpdated = async (updatedProject: any) => {
    const { data, error } = await supabase
      .from('projects')
      .update({
        title: updatedProject.title,
        description: updatedProject.description,
        status: updatedProject.status,
        priority: updatedProject.priority,
        due_date: updatedProject.dueDate || updatedProject.due_date || null,
        customer_id: updatedProject.customerId || updatedProject.customer_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
    } else if (data) {
      setProject(data)
      // Refresh customer if changed
      if (data.customer_id) {
        const { data: customerData } = await supabase
          .from('customers')
          .select('id, name, type')
          .eq('id', data.customer_id)
          .single()
        setCustomer(customerData)
      } else {
        setCustomer(null)
      }
    }
    setIsEditModalOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold">Project not found</h2>
        <Link href="/projects" className="text-teal-600 hover:underline mt-2 inline-block">
          Back to Projects
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">{project.title}</h1>
            {project.description && (
              <p className="text-muted-foreground max-w-3xl">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex gap-2 items-start">
            <Badge variant={getStatusVariant(project.status)}>
              {project.status.replace('_', ' ')}
            </Badge>
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Project Info Card */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Details about this project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge variant={getStatusVariant(project.status)}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Priority</p>
                <Badge variant={getPriorityVariant(project.priority)}>
                  {project.priority}
                </Badge>
              </div>
            </div>
            {project.owner && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Owner</p>
                  <p className="text-sm font-medium">{project.owner}</p>
                </div>
              </>
            )}
            {project.assignees && project.assignees.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Assignees</p>
                  <div className="flex flex-wrap gap-2">
                    {project.assignees.map((assignee, index) => (
                      <Badge key={index} variant="secondary">{assignee}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Customer</p>
              {customer ? (
                <Link href={`/customers/${customer.id}`} className="flex items-center gap-2 hover:underline">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {customer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">{customer.name}</p>
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">No customer assigned</p>
              )}
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Priority</p>
              <Badge variant={getPriorityVariant(project.priority)}>
                {project.priority}
              </Badge>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Due Date</p>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                {project.due_date ? formatDate(project.due_date) : 'No due date'}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created</p>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                {formatDate(project.created_at)}
              </div>
            </div>
            {project.completed_at && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completed</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {formatDate(project.completed_at)}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Communication */}
      <div>
        <CommentThread entityType="PROJECT" entityId={project.id} />
      </div>

      <CreateProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProjectCreated={handleProjectUpdated}
        customers={customers}
        initialData={{
          ...project,
          dueDate: project.due_date,
          customerId: project.customer_id
        }}
        isEditing={true}
      />
    </div>
  )
}
