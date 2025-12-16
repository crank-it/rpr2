'use client'

import { MessageCircle, ExternalLink, Send } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ActivityItem {
  id: string
  activityType: 'activity' | 'comment'
  title: string
  type: string
  time: string
  timestamp: string
  linkHref?: string | null

  // Comment-specific fields
  commentId?: string
  author?: string
  content?: string
  entityId?: string
  entityType?: string
  replyCount?: number
}

interface Reply {
  id: string
  author: string
  content: string
  timestamp: string
}

export default function ActivityFeedPage() {
  const [data, setData] = useState<{ recentActivity: ActivityItem[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [replies, setReplies] = useState<Record<string, Reply[]>>({})
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set())
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [submittingReply, setSubmittingReply] = useState<string | null>(null)

  useEffect(() => {
    fetchActivityData()
  }, [])

  const fetchActivityData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch activity data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async (commentId: string, entityType: string, entityId: string) => {
    setLoadingReplies(prev => new Set(prev).add(commentId))

    try {
      const response = await fetch(`/api/comments?entityType=${entityType}&entityId=${entityId}`)
      if (response.ok) {
        const comments = await response.json()
        const comment = comments.find((c: any) => c.id === commentId)
        if (comment && comment.replies) {
          setReplies(prev => ({
            ...prev,
            [commentId]: comment.replies
          }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch replies:', error)
    } finally {
      setLoadingReplies(prev => {
        const newSet = new Set(prev)
        newSet.delete(commentId)
        return newSet
      })
    }
  }

  const toggleComment = (commentId: string, entityType: string, entityId: string) => {
    const newExpanded = new Set(expandedComments)

    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
      // Fetch replies if not already loaded
      if (!replies[commentId]) {
        fetchReplies(commentId, entityType, entityId)
      }
    }

    setExpandedComments(newExpanded)
  }

  const handleSubmitReply = async (commentId: string, entityType: string, entityId: string) => {
    const content = replyText[commentId]?.trim()
    if (!content || submittingReply) return

    setSubmittingReply(commentId)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          content,
          author: 'User',
          parentId: commentId
        })
      })

      if (response.ok) {
        const newReply = await response.json()

        // Update replies
        setReplies(prev => ({
          ...prev,
          [commentId]: [...(prev[commentId] || []), newReply]
        }))

        // Update reply count in activity
        setData(prevData => {
          if (!prevData) return prevData
          return {
            ...prevData,
            recentActivity: prevData.recentActivity.map(item => {
              if (item.commentId === commentId) {
                return {
                  ...item,
                  replyCount: (item.replyCount || 0) + 1
                }
              }
              return item
            })
          }
        })

        // Clear reply text
        setReplyText(prev => ({
          ...prev,
          [commentId]: ''
        }))
      }
    } catch (error) {
      console.error('Failed to submit reply:', error)
    } finally {
      setSubmittingReply(null)
    }
  }

  const formatTimestamp = (timestamp: string | undefined | null): string => {
    if (!timestamp) return 'Unknown time'

    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return 'Unknown time'

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffSecs < 60) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-6 w-6 border-2 border-solid border-foreground border-r-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-normal text-foreground tracking-tight mb-3">
            Activity Feed
          </h1>
          <p className="text-sm text-muted-foreground">
            Recent activity and conversations
          </p>
        </div>

        {/* Activity Feed */}
        {data?.recentActivity && data.recentActivity.length > 0 ? (
          <div className="space-y-0">
            {data.recentActivity.map((activity, index) => (
              <div key={activity.id}>
                {activity.activityType === 'activity' ? (
                  // Regular activity item
                  <div className="py-6">
                    <div className="flex items-baseline justify-between gap-8">
                      <div className="flex-1 min-w-0">
                        {activity.linkHref ? (
                          <Link
                            href={activity.linkHref}
                            className="group"
                          >
                            <h3 className="text-base font-medium text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                              {activity.title}
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h3>
                          </Link>
                        ) : (
                          <h3 className="text-base font-medium text-foreground mb-1">
                            {activity.title}
                          </h3>
                        )}
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{activity.type}</span>
                          <span>·</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Comment item
                  <div className="py-6">
                    <div className="flex-1 min-w-0">
                      {activity.linkHref ? (
                        <Link
                          href={activity.linkHref}
                          className="group"
                        >
                          <h3 className="text-base font-medium text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                            {activity.title}
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="text-base font-medium text-foreground mb-1">
                          {activity.title}
                        </h3>
                      )}

                      <p className="text-sm text-foreground mb-2">{activity.content}</p>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                        <span>{activity.time}</span>
                        <span>·</span>
                        <button
                          onClick={() => toggleComment(
                            activity.commentId!,
                            activity.entityType!,
                            activity.entityId!
                          )}
                          className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                        >
                          <MessageCircle className="h-3 w-3" />
                          {activity.replyCount === 0 ? 'Reply' : `${activity.replyCount} ${activity.replyCount === 1 ? 'reply' : 'replies'}`}
                        </button>
                      </div>

                      {/* Expanded comment with replies */}
                      {expandedComments.has(activity.commentId!) && (
                        <div className="mt-4 pl-6 border-l-2 border-border">
                          {/* Replies */}
                          {loadingReplies.has(activity.commentId!) ? (
                            <div className="py-4 text-sm text-muted-foreground">
                              Loading replies...
                            </div>
                          ) : (
                            <>
                              {replies[activity.commentId!]?.map((reply) => (
                                <div key={reply.id} className="py-3 border-b border-border last:border-b-0">
                                  <p className="text-sm font-medium text-foreground mb-1">
                                    {reply.author}
                                  </p>
                                  <p className="text-sm text-foreground mb-1">
                                    {reply.content}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatTimestamp(reply.timestamp)}
                                  </p>
                                </div>
                              ))}
                            </>
                          )}

                          {/* Reply form */}
                          <div className="mt-4 relative">
                            <input
                              type="text"
                              value={replyText[activity.commentId!] || ''}
                              onChange={(e) => setReplyText(prev => ({
                                ...prev,
                                [activity.commentId!]: e.target.value
                              }))}
                              placeholder="Write a reply..."
                              className="w-full border-0 border-b border-border bg-transparent py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  handleSubmitReply(
                                    activity.commentId!,
                                    activity.entityType!,
                                    activity.entityId!
                                  )
                                }
                              }}
                            />
                            <button
                              onClick={() => handleSubmitReply(
                                activity.commentId!,
                                activity.entityType!,
                                activity.entityId!
                              )}
                              disabled={!replyText[activity.commentId!]?.trim() || submittingReply === activity.commentId}
                              className="absolute right-0 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {index < data.recentActivity.length - 1 && (
                  <div className="h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground mb-8">
              No recent activity
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Get started with your first project
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
