'use client'

import { Plus, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Filters } from '@/components/ui/filters'

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
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    type: '',
    sortBy: 'name'
  })

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

    const matchesType = !filterValues.type || customer.type === filterValues.type

    return matchesSearch && matchesType
  })

  // Apply sorting
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const sortBy = filterValues.sortBy
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === '-name') return b.name.localeCompare(a.name)
    if (sortBy === '-created_at') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortBy === 'created_at') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    return 0
  })

  // Get unique types for filter
  const customerTypes = Array.from(new Set(customers.map(c => c.type).filter(Boolean)))

  const filterConfig = [
    {
      key: 'type',
      label: 'Type',
      type: 'select' as const,
      options: customerTypes.map(type => ({
        label: type.charAt(0) + type.slice(1).toLowerCase(),
        value: type
      }))
    },
    {
      key: 'sortBy',
      label: 'Sort By',
      type: 'select' as const,
      options: [
        { label: 'Name (A-Z)', value: 'name' },
        { label: 'Name (Z-A)', value: '-name' },
        { label: 'Recently Added', value: '-created_at' },
        { label: 'Oldest Added', value: 'created_at' }
      ]
    }
  ]

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilterValues({
      type: '',
      sortBy: 'name'
    })
  }

  const formatCustomerType = (type: string) => {
    return type.charAt(0) + type.slice(1).toLowerCase()
  }

  // Get first letter for avatar
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
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
            {sortedCustomers.length} {sortedCustomers.length === 1 ? 'customer' : 'customers'}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-16">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              className="w-full border-0 border-b border-border bg-transparent py-3 pl-12 pr-20 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <Filters
                filters={filterConfig}
                values={filterValues}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </div>
          </div>
        </div>

        {/* Customers List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-foreground border-r-transparent"></div>
          </div>
        ) : sortedCustomers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-8">
              {searchQuery ? 'No customers found' : 'No customers yet'}
            </p>
            {!searchQuery && (
              <Link
                href="/customers/new"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add your first customer
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            {/* Group by first letter */}
            {(() => {
              const grouped = sortedCustomers.reduce((acc, customer) => {
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
                    <div key={customer.id}>
                      <Link
                        href={`/customers/${customer.id}`}
                        className="block py-6 transition-opacity hover:opacity-60"
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
        <Link
          href="/customers/new"
          className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft-lg hover:shadow-soft-xl transition-all hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>
    </div>
  )
}
