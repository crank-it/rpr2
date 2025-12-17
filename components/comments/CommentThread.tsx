'use client'

import { useState, useEffect } from 'react'
import { Send, Loader2, Pencil, Trash2, X, Check } from 'lucide-react'

interface Comment {
  id: string
  author: string
  authorAvatar?: string
  content: string
  timestamp: string
  replies?: Comment[]
}

interface CommentThreadProps {
  entityType: string
  entityId: string
  onAddReply?: (parentId: string, reply: Comment) => void
}

function formatTimestamp(timestamp: string | undefined | null): string {
  if (!timestamp) return 'Unknown time'

  const date = new Date(timestamp)

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Unknown time'
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

// Component that displays real-time relative timestamp
function RelativeTime({ timestamp }: { timestamp: string }) {
  const [formattedTime, setFormattedTime] = useState(() => formatTimestamp(timestamp))

  useEffect(() => {
    // Update immediately
    setFormattedTime(formatTimestamp(timestamp))

    // Update every minute for real-time display
    const interval = setInterval(() => {
      setFormattedTime(formatTimestamp(timestamp))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [timestamp])

  return <span className="text-sm text-gray-500">{formattedTime}</span>
}

export function CommentThread({ entityType, entityId }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [userRole, setUserRole] = useState<string>('')

  // Get current user's display name (temporarily hardcoded - no auth)
  const currentUserName = 'User'
  const isAdmin = userRole === 'admin' || userRole === 'superadmin'

  // Temporarily disabled - no authentication
  // useEffect(() => {
  //   async function fetchUserRole() {
  //     try {
  //       const response = await fetch('/api/users/me')
  //       if (response.ok) {
  //         const data = await response.json()
  //         setUserRole(data.role || '')
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch user role:', error)
  //     }
  //   }
  //   fetchUserRole()
  // }, [])

  useEffect(() => {
    async function fetchComments() {
      try {
        setLoading(true)
        const response = await fetch(`/api/comments?entityType=${entityType}&entityId=${entityId}`)
        if (response.ok) {
          const data = await response.json()
          // Keep raw timestamps - formatting will be done in the component
          setComments(data)
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error)
      } finally {
        setLoading(false)
      }
    }

    if (entityType && entityId) {
      fetchComments()
    }
  }, [entityType, entityId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || submitting) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          content: newComment,
          author: currentUserName
        })
      })

      if (response.ok) {
        const comment = await response.json()
        setComments([...comments, {
          ...comment,
          replies: []
        }])
        setNewComment('')
      }
    } catch (error) {
      console.error('Failed to create comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddReply = (parentId: string, reply: Comment) => {
    setComments(comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        }
      }
      return comment
    }))
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/comments?commentId=${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove comment from UI
        setComments(comments.filter(c => c.id !== commentId).map(comment => ({
          ...comment,
          replies: comment.replies?.filter(r => r.id !== commentId) || []
        })))
      } else {
        alert('Failed to delete comment')
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('Failed to delete comment')
    }
  }

  const handleEditComment = (commentId: string, newContent: string) => {
    // Update comment in UI
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return { ...c, content: newContent }
      }
      // Also check replies
      if (c.replies) {
        return {
          ...c,
          replies: c.replies.map(r =>
            r.id === commentId ? { ...r, content: newContent } : r
          )
        }
      }
      return c
    }))
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
        Discussion
      </h2>

      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-foreground border-r-transparent"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No comments yet</p>
          </div>
        ) : (
          <div className="p-6 space-y-0">
            {comments.map((comment, index) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  entityType={entityType}
                  entityId={entityId}
                  onReplyAdded={handleAddReply}
                  currentUserName={currentUserName}
                  isAdmin={isAdmin}
                  onDelete={handleDeleteComment}
                  onEdit={handleEditComment}
                />
                {index < comments.length - 1 && <div className="h-px bg-border" />}
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-border p-4">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-xl border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="p-2 text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  entityType: string
  entityId: string
  onReplyAdded: (parentId: string, reply: Comment) => void
  isReply?: boolean
  currentUserName: string
  isAdmin?: boolean
  onDelete?: (commentId: string) => void
  onEdit?: (commentId: string, newContent: string) => void
}

function CommentItem({ comment, entityType, entityId, onReplyAdded, isReply = false, currentUserName, isAdmin = false, onDelete, onEdit }: CommentItemProps) {
  const [showReply, setShowReply] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)

  const isOwnComment = comment.author === currentUserName
  const canModify = isOwnComment || isAdmin

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || submitting) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          content: replyContent,
          author: currentUserName,
          parentId: comment.id
        })
      })

      if (response.ok) {
        const reply = await response.json()
        onReplyAdded(comment.id, reply)
        setReplyContent('')
        setShowReply(false)
      }
    } catch (error) {
      console.error('Failed to create reply:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim() || submitting) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/comments?commentId=${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      })

      if (response.ok) {
        if (onEdit) {
          onEdit(comment.id, editContent)
        }
        setIsEditing(false)
      } else {
        alert('Failed to update comment')
      }
    } catch (error) {
      console.error('Failed to update comment:', error)
      alert('Failed to update comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    setEditContent(comment.content)
    setIsEditing(false)
  }

  return (
    <div className={isReply ? "py-4 pl-8" : "py-6"}>
      <div className="flex items-baseline justify-between gap-8 mb-1">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-foreground mb-1">
            {comment.author}
          </h3>

          {isEditing ? (
            <div className="mb-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                rows={3}
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || submitting}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
                >
                  <Check className="h-3 w-3" />
                  {submitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground mb-2">{comment.content}</p>
          )}

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <RelativeTime timestamp={comment.timestamp} />
            {!isReply && !isEditing && (
              <>
                <span>·</span>
                <button
                  onClick={() => setShowReply(!showReply)}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Reply
                </button>
              </>
            )}
            {canModify && !isEditing && (
              <>
                <span>·</span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Edit
                </button>
                <span>·</span>
                <button
                  onClick={() => onDelete && onDelete(comment.id)}
                  className="text-destructive hover:text-destructive/80 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {showReply && (
        <div className="mt-4 relative">
          <input
            type="text"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleSubmitReply}
              disabled={!replyContent.trim() || submitting}
              className="text-sm text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Sending...' : 'Reply'}
            </button>
            <button
              onClick={() => {
                setShowReply(false)
                setReplyContent('')
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-6 space-y-0 border-l border-border pl-0">
          {comment.replies.map((reply, index) => (
            <div key={reply.id}>
              <CommentItem
                comment={reply}
                entityType={entityType}
                entityId={entityId}
                onReplyAdded={onReplyAdded}
                isReply={true}
                currentUserName={currentUserName}
                isAdmin={isAdmin}
                onDelete={onDelete}
                onEdit={onEdit}
              />
              {comment.replies && index < comment.replies.length - 1 && <div className="h-px bg-border ml-8" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
