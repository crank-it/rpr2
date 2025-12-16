'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  Plus,
  Link as LinkIcon,
  ExternalLink,
  Users,
  MessageSquare,
  History,
  MoreVertical,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface System {
  id: string
  title: string
  category: string
  status: string
  description: string | null
  version: number
  createdBy: string
  createdAt: string
  updatedBy: string | null
  updatedAt: string | null
  userAcknowledgementStatus: 'acknowledged' | 'needs_acknowledgement' | 'update_required' | null
}

interface SystemLink {
  id: string
  title: string
  url: string
  linkType: string
  sortOrder: number
}

interface Assignment {
  id: string
  userId: string
  assignedBy: string
  assignedAt: string
  requiresAcknowledgement: boolean
  acknowledgedAt: string | null
  acknowledgedVersion: number | null
}

interface Comment {
  id: string
  userId: string
  content: string
  isEdited: boolean
  createdAt: string
  updatedAt: string | null
}

interface AuditLogEntry {
  id: string
  userId: string
  action: string
  details: any
  createdAt: string
}

const statusColors: Record<string, string> = {
  'Draft': 'secondary',
  'Start': 'outline',
  'Approve': 'default',
  'Need Review': 'destructive'
}

export default function SystemDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [system, setSystem] = useState<System | null>(null)
  const [links, setLinks] = useState<SystemLink[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'comments' | 'history'>('overview')

  // Form states
  const [newLinkTitle, setNewLinkTitle] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [newLinkType, setNewLinkType] = useState('external')
  const [showAddLink, setShowAddLink] = useState(false)

  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')

  useEffect(() => {
    fetchSystemData()
  }, [params.id])

  const fetchSystemData = async () => {
    try {
      setLoading(true)
      const [systemRes, linksRes, assignmentsRes, commentsRes, auditRes] = await Promise.all([
        fetch(`/api/systems/${params.id}`),
        fetch(`/api/systems/${params.id}/links`),
        fetch(`/api/systems/${params.id}/assignments`),
        fetch(`/api/systems/${params.id}/comments`),
        fetch(`/api/systems/${params.id}/audit`)
      ])

      if (systemRes.ok) {
        const systemData = await systemRes.json()
        setSystem(systemData)
      }

      if (linksRes.ok) {
        const linksData = await linksRes.json()
        setLinks(linksData)
      }

      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json()
        setAssignments(assignmentsData)
      }

      if (commentsRes.ok) {
        const commentsData = await commentsRes.json()
        setComments(commentsData)
      }

      if (auditRes.ok) {
        const auditData = await auditRes.json()
        setAuditLog(auditData)
      }
    } catch (error) {
      console.error('Failed to fetch system data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async () => {
    try {
      const response = await fetch(`/api/systems/${params.id}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (response.ok) {
        fetchSystemData()
      }
    } catch (error) {
      console.error('Failed to acknowledge:', error)
    }
  }

  const handleAddLink = async () => {
    if (!newLinkTitle || !newLinkUrl) return

    try {
      const response = await fetch(`/api/systems/${params.id}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newLinkTitle,
          url: newLinkUrl,
          linkType: newLinkType
        })
      })

      if (response.ok) {
        setNewLinkTitle('')
        setNewLinkUrl('')
        setNewLinkType('external')
        setShowAddLink(false)
        fetchSystemData()
      }
    } catch (error) {
      console.error('Failed to add link:', error)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/systems/${params.id}/links/${linkId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchSystemData()
      }
    } catch (error) {
      console.error('Failed to delete link:', error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/systems/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      })

      if (response.ok) {
        setNewComment('')
        fetchSystemData()
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleUpdateComment = async (commentId: string) => {
    if (!editingCommentContent.trim()) return

    try {
      const response = await fetch(`/api/systems/${params.id}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingCommentContent })
      })

      if (response.ok) {
        setEditingCommentId(null)
        setEditingCommentContent('')
        fetchSystemData()
      }
    } catch (error) {
      console.error('Failed to update comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/systems/${params.id}/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchSystemData()
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRelativeDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-solid border-gray-900 border-r-transparent rounded-full" />
      </div>
    )
  }

  if (!system) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">System not found</p>
          <Link href="/systems">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Systems
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link href="/systems">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Systems
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{system.title}</h1>
            <Badge variant={statusColors[system.status] as any || 'secondary'}>
              {system.status}
            </Badge>
            <span className="text-sm text-muted-foreground">v{system.version}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Category: <Badge variant="secondary">{system.category}</Badge></span>
            <span>Created by {system.createdBy} {formatRelativeDate(system.createdAt)}</span>
            {system.updatedAt && (
              <span>Updated {formatRelativeDate(system.updatedAt)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {system.userAcknowledgementStatus === 'needs_acknowledgement' && (
            <Button onClick={handleAcknowledge}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Acknowledge
            </Button>
          )}
          {system.userAcknowledgementStatus === 'update_required' && (
            <Button onClick={handleAcknowledge} variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Acknowledge Update
            </Button>
          )}
          <Link href={`/systems/${system.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="h-4 w-4" />
            Assigned Users ({assignments.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'comments'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Comments ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="h-4 w-4" />
            History
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-base font-medium mb-4">Description</h3>
              {system.description ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {system.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No description provided</p>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium">Links & Resources</h3>
                <Button size="sm" onClick={() => setShowAddLink(!showAddLink)}>
                  {showAddLink ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Link
                    </>
                  )}
                </Button>
              </div>

              {showAddLink && (
                <div className="mb-4 p-4 border rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Link title"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <select
                    value={newLinkType}
                    onChange={(e) => setNewLinkType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="external">External Link</option>
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                    <option value="other">Other</option>
                  </select>
                  <Button onClick={handleAddLink} size="sm">
                    Add Link
                  </Button>
                </div>
              )}

              {links.length > 0 ? (
                <div className="space-y-2">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                          >
                            {link.title}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <p className="text-xs text-muted-foreground">{link.linkType}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No links added yet</p>
              )}
            </Card>
          </div>
        )}

        {/* Assigned Users Tab */}
        {activeTab === 'users' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium">Assigned Users</h3>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Assign Users
              </Button>
            </div>

            {assignments.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Assigned By</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Assigned Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {assignments.map((assignment) => {
                      const status = assignment.acknowledgedVersion === system.version
                        ? 'acknowledged'
                        : assignment.acknowledgedVersion
                        ? 'update_required'
                        : 'needs_acknowledgement'

                      return (
                        <tr key={assignment.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium">
                            {assignment.userId}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {assignment.assignedBy}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(assignment.assignedAt)}
                          </td>
                          <td className="py-3 px-4">
                            {status === 'acknowledged' && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-xs">Acknowledged v{assignment.acknowledgedVersion}</span>
                              </div>
                            )}
                            {status === 'needs_acknowledgement' && (
                              <Badge variant="outline" className="text-amber-600">
                                Needs acknowledgement
                              </Badge>
                            )}
                            {status === 'update_required' && (
                              <Badge variant="outline" className="text-red-600">
                                Update required (v{assignment.acknowledgedVersion})
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No users assigned yet</p>
            )}
          </Card>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            <Card className="p-4">
              <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm min-h-[100px] resize-none"
              />
              <div className="flex justify-end mt-2">
                <Button onClick={handleAddComment} size="sm">
                  Post Comment
                </Button>
              </div>
            </Card>

            {comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <Card key={comment.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium">{comment.userId}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDate(comment.createdAt)}
                          {comment.isEdited && ' (edited)'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCommentId(comment.id)
                            setEditingCommentContent(comment.content)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingCommentContent}
                          onChange={(e) => setEditingCommentContent(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateComment(comment.id)}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCommentId(null)
                              setEditingCommentContent('')
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-sm text-muted-foreground italic">No comments yet</p>
              </Card>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <Card className="p-6">
            <h3 className="text-base font-medium mb-4">Audit Log</h3>
            {auditLog.length > 0 ? (
              <div className="space-y-3">
                {auditLog.map((entry) => (
                  <div key={entry.id} className="flex gap-4 pb-3 border-b last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{entry.userId}</span>
                        <Badge variant="secondary" className="text-xs">
                          {entry.action.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.createdAt)}
                      </p>
                      {entry.details && Object.keys(entry.details).length > 0 && (
                        <pre className="text-xs text-muted-foreground mt-1 bg-gray-50 p-2 rounded">
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No history available</p>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
