'use client'

import { Plus, Search, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CreateCustomerModal } from '@/components/customers/CreateCustomerModal'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'

interface Customer {
  id: string
  name: string
  type: string
  email: string | null
  phone: string | null
  primaryContact: string | null
  createdAt: string
  tags: string[]
  brands: string[]
  _count?: {
    projects: number
    activities: number
  }
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/customers')
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.type?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const formatCustomerType = (type: string) => {
    return type.charAt(0) + type.slice(1).toLowerCase()
  }

  const handleCustomerCreated = async (customerData: any) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      })

      if (!response.ok) {
        throw new Error('Failed to create customer')
      }

      const newCustomer = await response.json()
      setIsCreateModalOpen(false)
      router.push(`/customers/${newCustomer.id}`)
    } catch (error) {
      console.error('Failed to create customer:', error)
      alert('Failed to create customer. Please try again.')
    }
  }

  // Get first letter for avatar
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return

    const response = await fetch(`/api/customers/${customerToDelete.id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete customer')
    }

    fetchCustomers()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-normal text-foreground tracking-tight mb-3">
            Customers
          </h1>
          <p className="text-sm text-muted-foreground">
            {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-16">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            className="w-full border-0 border-b border-border bg-transparent py-3 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Customers List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-foreground border-r-transparent"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-8">
              {searchQuery ? 'No customers found' : 'No customers yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add your first customer
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            {/* Group by first letter */}
            {(() => {
              const grouped = filteredCustomers.reduce((acc, customer) => {
                const letter = customer.name.charAt(0).toUpperCase()
                if (!acc[letter]) acc[letter] = []
                acc[letter].push(customer)
                return acc
              }, {} as Record<string, Customer[]>)

              return Object.keys(grouped).sort().map((letter) => (
                <div key={letter}>
                  {/* Letter divider */}
                  <div className="flex items-center gap-4 py-6">
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {letter}
                    </div>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Customers in this group */}
                  {grouped[letter].map((customer, index) => (
                    <div key={customer.id} className="group">
                      <div className="flex items-center">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="flex-1 py-6 transition-opacity hover:opacity-60"
                        >
                          <div className="flex items-baseline justify-between gap-8">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-medium text-foreground mb-1">
                                {customer.name}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                {customer.type && (
                                  <>
                                    <span>{formatCustomerType(customer.type)}</span>
                                    {customer.email && <span>·</span>}
                                  </>
                                )}
                                {customer.email && (
                                  <span>{customer.email}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                        <button
                          onClick={() => setCustomerToDelete(customer)}
                          className="p-3 mr-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete customer"
                        >
                          <Trash2 className="h-4 w-4 hover:text-[lab(55.4814%_75.0732_48.8528)]" />
                        </button>
                      </div>
                      {index < grouped[letter].length - 1 && (
                        <div className="h-px bg-border" />
                      )}
                    </div>
                  ))}
                </div>
              ))
            })()}
          </div>
        )}

        {/* Floating action button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft-lg hover:shadow-soft-xl transition-all hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </button>

        {/* Create Customer Modal */}
        <CreateCustomerModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCustomerCreated={handleCustomerCreated}
        />

        {/* Delete Customer Modal */}
        {customerToDelete && (
          <DeleteConfirmModal
            isOpen={!!customerToDelete}
            onClose={() => setCustomerToDelete(null)}
            onConfirm={handleDeleteCustomer}
            title="Delete Customer"
            itemName={customerToDelete.name}
            warningMessage="This action cannot be undone."
            cascadeMessage="Projects linked to this customer will have their customer reference removed."
          />
        )}
      </div>
    </div>
  )
}
