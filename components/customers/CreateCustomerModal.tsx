'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface CreateCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onCustomerCreated?: (customer: any) => void
  initialData?: any
  isEditing?: boolean
}

export function CreateCustomerModal({ isOpen, onClose, onCustomerCreated, initialData, isEditing = false }: CreateCustomerModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'SALON',
    email: '',
    phone: '',
    website: '',
    address: '',
    notes: '',
    primary_contact: '',
    brands: [] as string[],
    spending_tier: null as string | null,
    annual_spend: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        type: initialData.type || 'SALON',
        email: initialData.email || '',
        phone: initialData.phone || '',
        website: initialData.website || '',
        address: initialData.address || '',
        notes: initialData.notes || '',
        primary_contact: initialData.primary_contact || initialData.primaryContact || '',
        brands: initialData.brands || [],
        spending_tier: initialData.spending_tier || initialData.spendingTier || null,
        annual_spend: initialData.annual_spend?.toString() || initialData.annualSpend?.toString() || ''
      })
    } else {
      setFormData({
        name: '',
        type: 'SALON',
        email: '',
        phone: '',
        website: '',
        address: '',
        notes: '',
        primary_contact: '',
        brands: [],
        spending_tier: null,
        annual_spend: ''
      })
    }
  }, [initialData, isOpen])

  const RPR_BRANDS = ['RPR', 'Salon Only', 'Mycolour', 'AMIPLEX', 'Keratin Smooth & Gloss', 'ColourU']

  const toggleBrand = (brand: string) => {
    setFormData(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b: string) => b !== brand)
        : [...prev.brands, brand]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const customerData = {
        name: formData.name,
        type: formData.type,
        email: formData.email || null,
        phone: formData.phone || null,
        website: formData.website || null,
        address: formData.address || null,
        primary_contact: formData.primary_contact || null,
        brands: formData.brands,
        spending_tier: formData.spending_tier || null,
        annual_spend: formData.annual_spend ? parseFloat(formData.annual_spend) : null
      }

      if (onCustomerCreated) {
        onCustomerCreated(customerData)
      }
    } catch (error) {
      console.error('Failed to save customer:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Customer" : "Add New Customer"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Customer Name"
            placeholder="e.g., Luxe Hair Salon"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { value: 'SALON', label: 'Salon' },
              { value: 'DISTRIBUTOR', label: 'Distributor' },
              { value: 'CORPORATE', label: 'Corporate' },
              { value: 'VIP', label: 'VIP' }
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="contact@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Phone"
            type="tel"
            placeholder="+61 2 9999 8888"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Website"
            type="url"
            placeholder="https://example.com"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />

          <Input
            label="Primary Contact"
            placeholder="Contact person name"
            value={formData.primary_contact}
            onChange={(e) => setFormData({ ...formData, primary_contact: e.target.value })}
          />
        </div>

        <Input
          label="Address"
          placeholder="123 Main St, Sydney NSW 2000"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />

        <div>
          <label className="text-sm font-medium text-gray-900 mb-2 block">
            Brands Carried
          </label>
          <div className="flex flex-wrap gap-2">
            {RPR_BRANDS.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => toggleBrand(brand)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  formData.brands.includes(brand)
                    ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Spending Tier"
            value={formData.spending_tier || ''}
            onChange={(e) => setFormData({ ...formData, spending_tier: e.target.value || null })}
            options={[
              { value: '', label: 'None' },
              { value: 'TOP_1', label: 'Top 1% Spender' },
              { value: 'TOP_3', label: 'Top 3% Spender' },
              { value: 'TOP_10', label: 'Top 10% Spender' }
            ]}
          />

          <Input
            label="Annual Spend (AUD)"
            type="number"
            placeholder="50000"
            value={formData.annual_spend}
            onChange={(e) => setFormData({ ...formData, annual_spend: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-2">
          <Button type="button" variant="outline" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.name} className="px-6">
            {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Add Customer')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
