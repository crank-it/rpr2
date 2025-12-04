'use client'

import { useState } from 'react'
import { Send, Paperclip, MoreVertical, Heart, MessageCircle } from 'lucide-react'

interface Comment {
  id: string
  author: string
  authorAvatar?: string
  content: string
  timestamp: string
  replies?: Comment[]
  reactions?: { emoji: string; count: number }[]
}

interface CommentThreadProps {
  entityType: string
  entityId: string
}

export function CommentThread({ entityType, entityId }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Sarah Mitchell',
      content: 'Looking great! Can we adjust the color palette to match the summer campaign?',
      timestamp: '2 hours ago',
      reactions: [{ emoji: '👍', count: 3 }],
      replies: [
        {
          id: '2',
          author: 'Ben Thompson',
          content: 'Absolutely! I\'ll update the mockups by end of day.',
          timestamp: '1 hour ago',
          reactions: [{ emoji: '❤️', count: 1 }],
        }
      ]
    },
    {
      id: '3',
      author: 'Michael Chen',
      content: 'The new assets are ready for review. Let me know if you need any revisions.',
      timestamp: '30 minutes ago',
    }
  ])

  const [newComment, setNewComment] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const comment: Comment = {
      id: String(Date.now()),
      author: 'You',
      content: newComment,
      timestamp: 'Just now'
    }

    setComments([...comments, comment])
    setNewComment('')
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
        {comments.length === 0 ? (
          <div className="px-8 py-16 text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-6">
        <div className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment... Use @ to mention someone"
            className="w-full min-h-24 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[rgb(247,141,208)]/20 focus:border-[rgb(247,141,208)]"
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Paperclip className="h-4 w-4" />
              Attach
            </button>

            <div className="flex items-center gap-3">
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
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-[rgb(247,141,208)] text-white rounded-lg hover:bg-[rgb(215,177,184)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
                Comment
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function CommentItem({ comment }: { comment: Comment }) {
  const [showReply, setShowReply] = useState(false)

  return (
    <div className="px-8 py-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[rgb(247,141,208)] to-[rgb(215,177,184)] flex items-center justify-center text-white font-semibold">
            {comment.author.charAt(0)}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900">{comment.author}</span>
            <span className="text-sm text-gray-500">{comment.timestamp}</span>
          </div>

          <p className="text-gray-700 mb-3">{comment.content}</p>

          <div className="flex items-center gap-4">
            {comment.reactions?.map((reaction, idx) => (
              <button
                key={idx}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm">{reaction.emoji}</span>
                <span className="text-xs text-gray-600">{reaction.count}</span>
              </button>
            ))}
            <button className="text-sm text-gray-500 hover:text-[rgb(247,141,208)] transition-colors">
              React
            </button>
            <button
              onClick={() => setShowReply(!showReply)}
              className="text-sm text-gray-500 hover:text-[rgb(247,141,208)] transition-colors"
            >
              Reply
            </button>
            <button className="text-sm text-gray-500 hover:text-gray-700 ml-auto">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-6 space-y-6 pl-6 border-l-2 border-gray-100">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} />
              ))}
            </div>
          )}

          {/* Reply Form */}
          {showReply && (
            <div className="mt-4">
              <textarea
                placeholder="Write a reply..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[rgb(247,141,208)]/20 focus:border-[rgb(247,141,208)]"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setShowReply(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 text-sm bg-[rgb(247,141,208)] text-white rounded-lg hover:bg-[rgb(215,177,184)] transition-colors">
                  Reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
