'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, CheckCircle2, Circle, Clock, ImageIcon, MessageSquare, Pencil } from 'lucide-react'
import { CommentThread } from '@/components/comments/CommentThread'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const DEMO_CUSTOMERS = [
  { id: '1', name: 'Luxe Hair Studio', type: 'SALON' },
  { id: '2', name: 'Beauty Wholesale Co', type: 'DISTRIBUTOR' },
  { id: '3', name: 'Elite Salon Group', type: 'CORPORATE' },
  { id: '4', name: 'Glamour Palace', type: 'VIP' }
]

const DEMO_PROJECTS = [
  {
    id: '1',
    title: 'Summer Campaign Assets',
    description: 'Create visual assets for summer color collection launch across all marketing channels',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    customer: DEMO_CUSTOMERS[0],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    _count: { tasks: 12, assets: 8 },
    tasks: [
      { id: '1', title: 'Design hero banner', status: 'COMPLETED', assignee: 'Sarah Mitchell' },
      { id: '2', title: 'Create social media templates', status: 'IN_PROGRESS', assignee: 'Ben Thompson' },
      { id: '3', title: 'Product photography review', status: 'IN_PROGRESS', assignee: 'Michael Chen' },
      { id: '4', title: 'Email campaign mockups', status: 'TODO', assignee: 'Sarah Mitchell' },
      { id: '5', title: 'Video assets editing', status: 'TODO', assignee: null }
    ],
    recentAssets: [
      { id: '1', name: 'hero-banner-v3.jpg', type: 'image/jpeg', uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '2', name: 'social-template-instagram.psd', type: 'application/photoshop', uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '3', name: 'product-shots-final.zip', type: 'application/zip', uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: '2',
    title: 'Distributor Training Materials',
    description: 'Develop comprehensive training content for new product line rollout to distributors',
    status: 'REVIEW',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    customer: DEMO_CUSTOMERS[1],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    _count: { tasks: 8, assets: 15 },
    tasks: [
      { id: '6', title: 'Product knowledge guide', status: 'COMPLETED', assignee: 'Alex Johnson' },
      { id: '7', title: 'Training video scripts', status: 'REVIEW', assignee: 'Ben Thompson' },
      { id: '8', title: 'Quiz and assessment', status: 'IN_PROGRESS', assignee: 'Sarah Mitchell' }
    ],
    recentAssets: [
      { id: '4', name: 'training-guide-v2.pdf', type: 'application/pdf', uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '5', name: 'video-script-final.docx', type: 'application/word', uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  }
]

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
  const project = DEMO_PROJECTS.find(p => p.id === projectId) || DEMO_PROJECTS[0]
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleProjectUpdated = (updatedProject: any) => {
    // In a real app, this would update the project in state/database
    console.log('Project updated:', updatedProject)
    setIsEditModalOpen(false)
  }

  const taskStats = {
    completed: project.tasks.filter(t => t.status === 'COMPLETED').length,
    inProgress: project.tasks.filter(t => t.status === 'IN_PROGRESS').length,
    todo: project.tasks.filter(t => t.status === 'TODO').length,
    total: project.tasks.length
  }

  const completionPercentage = Math.round((taskStats.completed / taskStats.total) * 100)

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
            <p className="text-muted-foreground max-w-3xl">
              {project.description}
            </p>
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
        {/* Progress Card */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>{completionPercentage}% complete</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-teal-500 h-2 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="pt-6">
                  <div className="text-2xl font-semibold text-emerald-600">{taskStats.completed}</div>
                  <p className="text-xs text-emerald-600 mt-1">Completed</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-2xl font-semibold text-blue-600">{taskStats.inProgress}</div>
                  <p className="text-xs text-blue-600 mt-1">In Progress</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-6">
                  <div className="text-2xl font-semibold text-gray-600">{taskStats.todo}</div>
                  <p className="text-xs text-gray-600 mt-1">To Do</p>
                </CardContent>
              </Card>
            </div>
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
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {project.customer?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">{project.customer?.name || '-'}</p>
              </div>
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
                {project.dueDate ? formatDate(project.dueDate) : '-'}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created</p>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                {formatDate(project.createdAt)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Track progress on individual tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {project.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                {task.status === 'COMPLETED' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                ) : task.status === 'IN_PROGRESS' ? (
                  <Clock className="h-5 w-5 text-blue-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.status === 'COMPLETED' ? 'text-gray-500 line-through' : ''}`}>
                    {task.title}
                  </p>
                  {task.assignee && (
                    <div className="flex items-center gap-1 mt-1">
                      <User className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-muted-foreground">{task.assignee}</p>
                    </div>
                  )}
                </div>
                <Badge variant={
                  task.status === 'COMPLETED' ? 'success' :
                  task.status === 'IN_PROGRESS' ? 'default' :
                  'secondary'
                } className="text-xs">
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Assets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Assets</CardTitle>
            <CardDescription>Files uploaded to this project</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/assets">View All →</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {project.recentAssets.map((asset) => (
              <div key={asset.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <ImageIcon className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded {formatDate(asset.uploadedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Communication */}
      <div>
        <CommentThread entityType="PROJECT" entityId={project.id} />
      </div>

      <CreateProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProjectCreated={handleProjectUpdated}
        customers={DEMO_CUSTOMERS}
        initialData={project}
        isEditing={true}
      />
    </div>
  )
}
