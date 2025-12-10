'use client'

import { useState, useEffect } from 'react'
import { Send, MessageCircle, Loader2 } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

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
  const { user } = useUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')

  // Get current user's display name
  const currentUserName = user?.fullName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Unknown'

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

  return (
    <div className="luxury-card">
      <div className="px-8 py-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Discussion</h3>
        <p className="text-sm text-gray-500 mt-1">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </p>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="px-8 py-16 text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="px-8 py-16 text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                entityType={entityType}
                entityId={entityId}
                onReplyAdded={handleAddReply}
                currentUserName={currentUserName}
              />
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-6">
        <div className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full min-h-24 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[rgb(247,141,208)]/20 focus:border-[rgb(247,141,208)]"
          />

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setNewComment('')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              disabled={!newComment}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="flex items-center gap-2 px-6 py-2 bg-[rgb(247,141,208)] text-white rounded-lg hover:bg-[rgb(215,177,184)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {submitting ? 'Posting...' : 'Comment'}
            </button>
          </div>
        </div>
      </form>
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
}

function CommentItem({ comment, entityType, entityId, onReplyAdded, isReply = false, currentUserName }: CommentItemProps) {
  const [showReply, setShowReply] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  return (
    <div className={isReply ? "py-4" : "px-8 py-6"}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className={`${isReply ? 'h-8 w-8' : 'h-10 w-10'} rounded-full bg-gradient-to-br from-[rgb(247,141,208)] to-[rgb(215,177,184)] flex items-center justify-center text-white font-semibold text-sm`}>
            {comment.author.charAt(0)}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900">{comment.author}</span>
            <RelativeTime timestamp={comment.timestamp} />
          </div>

          <p className="text-gray-700 mb-3">{comment.content}</p>

          {!isReply && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-sm text-gray-500 hover:text-[rgb(247,141,208)] transition-colors"
              >
                Reply
              </button>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-6 space-y-2 pl-6 border-l-2 border-gray-100">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  entityType={entityType}
                  entityId={entityId}
                  onReplyAdded={onReplyAdded}
                  isReply={true}
                  currentUserName={currentUserName}
                />
              ))}
            </div>
          )}

          {/* Reply Form */}
          {showReply && (
            <div className="mt-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[rgb(247,141,208)]/20 focus:border-[rgb(247,141,208)]"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setShowReply(false)
                    setReplyContent('')
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || submitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-[rgb(247,141,208)] text-white rounded-lg hover:bg-[rgb(215,177,184)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                  {submitting ? 'Sending...' : 'Reply'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
