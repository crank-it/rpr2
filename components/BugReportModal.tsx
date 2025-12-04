'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Bug, CheckCircle2 } from 'lucide-react'

interface BugReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'bug',
    description: '',
    page: '',
    priority: 'medium'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate submission
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)

      // Reset after 2 seconds
      setTimeout(() => {
        setSubmitted(false)
        setFormData({
          title: '',
          type: 'bug',
          description: '',
          page: '',
          priority: 'medium'
        })
        onClose()
      }, 2000)
    }, 1000)
  }

  const handleClose = () => {
    if (!submitted) {
      setFormData({
        title: '',
        type: 'bug',
        description: '',
        page: '',
        priority: 'medium'
      })
    }
    onClose()
  }

  if (submitted) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Issue Reported" size="md">
        <div className="text-center py-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Thank you for your feedback!
          </h3>
          <p className="text-sm text-gray-600">
            We've received your report and will look into it shortly.
          </p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Report an Issue" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Issue Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { value: 'bug', label: 'Bug' },
              { value: 'feature', label: 'Feature Request' },
              { value: 'improvement', label: 'Improvement' },
              { value: 'question', label: 'Question' }
            ]}
          />

          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' }
            ]}
          />
        </div>

        <Input
          label="Issue Title"
          placeholder="Brief description of the issue"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <Input
          label="Page/Location (Optional)"
          placeholder="e.g., Projects page, Dashboard"
          value={formData.page}
          onChange={(e) => setFormData({ ...formData, page: e.target.value })}
        />

        <Textarea
          label="Detailed Description"
          placeholder="Please describe what's not working or what you'd like to see..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="min-h-[150px]"
        />

        <div className="flex justify-end gap-3 pt-6 mt-2">
          <Button type="button" variant="outline" onClick={handleClose} className="px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.title || !formData.description} className="px-6">
            {loading ? 'Submitting...' : 'Submit Issue'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
