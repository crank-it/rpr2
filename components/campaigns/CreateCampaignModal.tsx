'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onCampaignCreated?: (campaign: any) => void
  initialData?: any
  isEditing?: boolean
}

export function CreateCampaignModal({ isOpen, onClose, onCampaignCreated, initialData, isEditing = false }: CreateCampaignModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    audience: 'BOTH',
    status: 'draft',
    launchDate: '',
    endDate: '',
    distributorPreviewDate: '',
    salonLaunchDate: '',
    consumerLaunchDate: '',
    budget: '',
    goals: '',
    progress: '0'
  })

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        audience: initialData.audience || 'BOTH',
        status: initialData.status || 'draft',
        launchDate: initialData.launchDate ? new Date(initialData.launchDate).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        distributorPreviewDate: initialData.distributorPreviewDate ? new Date(initialData.distributorPreviewDate).toISOString().split('T')[0] : '',
        salonLaunchDate: initialData.salonLaunchDate ? new Date(initialData.salonLaunchDate).toISOString().split('T')[0] : '',
        consumerLaunchDate: initialData.consumerLaunchDate ? new Date(initialData.consumerLaunchDate).toISOString().split('T')[0] : '',
        budget: initialData.budget ? String(initialData.budget) : '',
        goals: initialData.goals?.join(', ') || '',
        progress: initialData.progress !== undefined ? String(initialData.progress) : '0'
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const goalsArray = formData.goals.split(',').map(g => g.trim()).filter(Boolean)

      const campaignData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        goals: goalsArray,
        progress: formData.progress ? parseInt(formData.progress) : 0,
        launchDate: new Date(formData.launchDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        distributorPreviewDate: formData.distributorPreviewDate ? new Date(formData.distributorPreviewDate).toISOString() : null,
        salonLaunchDate: formData.salonLaunchDate ? new Date(formData.salonLaunchDate).toISOString() : null,
        consumerLaunchDate: formData.consumerLaunchDate ? new Date(formData.consumerLaunchDate).toISOString() : null
      }

      // Call the callback to add the campaign to the parent component's state
      if (onCampaignCreated) {
        onCampaignCreated(campaignData)
      }

      onClose()
      setFormData({
        name: '',
        description: '',
        audience: 'BOTH',
        status: 'draft',
        launchDate: '',
        endDate: '',
        distributorPreviewDate: '',
        salonLaunchDate: '',
        consumerLaunchDate: '',
        budget: '',
        goals: '',
        progress: '0'
      })
    } catch (error) {
      console.error('Failed to create campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Campaign" : "Create New Campaign"} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Campaign Details</h3>
          <div className="space-y-4">
            <Input
              label="Campaign Name"
              placeholder="e.g., Summer Color Collection Launch 2024"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Textarea
              label="Description"
              placeholder="Describe the campaign objectives and key messaging..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Target Audience"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                options={[
                  { value: 'B2B', label: 'B2B (Distributors & Salons)' },
                  { value: 'B2C', label: 'B2C (Consumers)' },
                  { value: 'BOTH', label: 'Both (Coordinated Launch)' }
                ]}
              />

              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'planning', label: 'Planning' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Campaign Timeline</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Launch Date"
                type="date"
                value={formData.launchDate}
                onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
                required
              />

              <Input
                label="End Date (Optional)"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            {formData.audience === 'BOTH' && (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-md">
                <p className="text-sm font-medium text-gray-900 mb-3">Coordinated Launch Phases</p>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Distributor Preview"
                    type="date"
                    placeholder="T-30 days"
                    value={formData.distributorPreviewDate}
                    onChange={(e) => setFormData({ ...formData, distributorPreviewDate: e.target.value })}
                  />

                  <Input
                    label="Salon Training"
                    type="date"
                    placeholder="T-14 days"
                    value={formData.salonLaunchDate}
                    onChange={(e) => setFormData({ ...formData, salonLaunchDate: e.target.value })}
                  />

                  <Input
                    label="Consumer Tease"
                    type="date"
                    placeholder="T-7 days"
                    value={formData.consumerLaunchDate}
                    onChange={(e) => setFormData({ ...formData, consumerLaunchDate: e.target.value })}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Stagger your launch for maximum impact: Preview → Train → Tease → Launch
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Budget & Goals */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Budget & Objectives</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Budget (AUD)"
                type="number"
                placeholder="25000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />

              <Input
                label="Progress (%)"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
              />
            </div>

            <Input
              label="Campaign Goals"
              placeholder="awareness, sales, training (comma-separated)"
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-2">
          <Button type="button" variant="outline" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.name || !formData.launchDate} className="px-6">
            {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Campaign')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
