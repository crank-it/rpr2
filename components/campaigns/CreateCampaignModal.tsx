'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { MultiSelect } from '@/components/ui/multi-select'

interface Asset {
  id: string
  name: string
  type: string
  url: string
}

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onCampaignCreated?: (campaign: any) => void
  initialData?: any
  isEditing?: boolean
}

export function CreateCampaignModal({ isOpen, onClose, onCampaignCreated, initialData, isEditing = false }: CreateCampaignModalProps) {
  const [loading, setLoading] = useState(false)
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([])
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([])
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

  // Fetch available assets when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAssets()
    }
  }, [isOpen])

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets')
      if (response.ok) {
        const assets = await response.json()
        setAvailableAssets(assets)
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    }
  }

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        audience: initialData.audience?.toUpperCase() || 'BOTH',
        status: initialData.status?.toLowerCase() || 'draft',
        launchDate: initialData.launchDate ? new Date(initialData.launchDate).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        distributorPreviewDate: initialData.distributorPreviewDate ? new Date(initialData.distributorPreviewDate).toISOString().split('T')[0] : '',
        salonLaunchDate: initialData.salonLaunchDate ? new Date(initialData.salonLaunchDate).toISOString().split('T')[0] : '',
        consumerLaunchDate: initialData.consumerLaunchDate ? new Date(initialData.consumerLaunchDate).toISOString().split('T')[0] : '',
        budget: initialData.budget ? String(initialData.budget) : '',
        goals: initialData.goals?.join(', ') || '',
        progress: initialData.progress !== undefined ? String(initialData.progress) : '0'
      })
      // Set selected assets when editing (assets is now an array of IDs)
      if (initialData.assets && Array.isArray(initialData.assets)) {
        // Check if assets are objects (full asset data) or strings (just IDs)
        if (typeof initialData.assets[0] === 'object') {
          setSelectedAssetIds(initialData.assets.map((asset: Asset) => asset.id))
        } else {
          setSelectedAssetIds(initialData.assets)
        }
      }
    } else {
      setSelectedAssetIds([])
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const goalsArray = formData.goals.split(',').map(g => g.trim()).filter(Boolean)

      const campaignData = {
        name: formData.name,
        description: formData.description,
        audience: formData.audience,
        status: formData.status,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        goals: goalsArray,
        progress: formData.progress ? parseInt(formData.progress) : 0,
        launchDate: new Date(formData.launchDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        distributorPreviewDate: formData.distributorPreviewDate ? new Date(formData.distributorPreviewDate).toISOString() : null,
        salonLaunchDate: formData.salonLaunchDate ? new Date(formData.salonLaunchDate).toISOString() : null,
        consumerLaunchDate: formData.consumerLaunchDate ? new Date(formData.consumerLaunchDate).toISOString() : null,
        assetIds: selectedAssetIds
      }

      let result
      if (isEditing && initialData?.id) {
        // Update existing campaign via API
        const response = await fetch(`/api/campaigns/${initialData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(campaignData)
        })
        if (!response.ok) throw new Error('Failed to update campaign')
        result = await response.json()
      } else {
        // Create new campaign via API
        const response = await fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(campaignData)
        })
        if (!response.ok) throw new Error('Failed to create campaign')
        result = await response.json()
      }

      // Call the callback with the result from API
      if (onCampaignCreated) {
        onCampaignCreated(result)
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
      setSelectedAssetIds([])
    } catch (error) {
      console.error('Failed to save campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Campaign" : "Create New Campaign"} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Campaign Details</h3>
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
              required
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
                required
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
          <h3 className="text-sm font-semibold text-foreground mb-3">Campaign Timeline</h3>
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

            {formData.audience?.toUpperCase() === 'BOTH' && (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-md">
                <p className="text-sm font-medium text-foreground mb-3">Coordinated Launch Phases</p>
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
                <p className="text-xs text-muted-foreground mt-2">
                  Stagger your launch for maximum impact: Preview → Train → Tease → Launch
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Assets */}
        <div className="relative">
          <h3 className="text-sm font-semibold text-foreground mb-3">Campaign Assets <span className="font-normal text-muted-foreground">(Optional)</span></h3>
          <MultiSelect
            label="Select Assets"
            placeholder="Choose assets for this campaign..."
            options={availableAssets.map(asset => ({
              value: asset.id,
              label: `${asset.name} (${asset.type})`
            }))}
            value={selectedAssetIds}
            onChange={setSelectedAssetIds}
          />
          {selectedAssetIds.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {selectedAssetIds.length} asset{selectedAssetIds.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Budget & Goals */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Budget & Objectives</h3>
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
          <Button type="submit" disabled={loading || !formData.name || !formData.description || !formData.launchDate || !formData.audience} className="px-6">
            {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Campaign')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
