'use client'

import { Plus, Users as UsersIcon, Search, Filter, Mail, Phone, FolderOpen, Pencil, Trash2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CreateCustomerModal } from '@/components/customers/CreateCustomerModal'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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

const getCustomerTypeVariant = (type: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
    'SALON': 'default',
    'DISTRIBUTOR': 'secondary',
    'CORPORATE': 'warning',
    'VIP': 'destructive'
  }
  return variants[type] || 'secondary'
}


export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const filterRef = useRef<HTMLDivElement>(null)

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

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCustomerCreated = async (newCustomer: any) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      })
      if (!response.ok) {
        throw new Error('Failed to create customer')
      }
      const data = await response.json()
      setCustomers([data, ...customers])
    } catch (error) {
      console.error('Error creating customer:', error)
    }
    setIsCreateModalOpen(false)
  }

  const handleCustomerUpdated = async (updatedCustomer: any) => {
    if (!editingCustomer) return

    try {
      const response = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCustomer)
      })
      if (!response.ok) {
        throw new Error('Failed to update customer')
      }
      const data = await response.json()
      setCustomers(customers.map(c => c.id === editingCustomer.id ? data : c))
    } catch (error) {
      console.error('Error updating customer:', error)
    }
    setEditingCustomer(null)
  }

  const handleEditClick = (customer: Customer, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingCustomer(customer)
  }

  const handleDeleteClick = (customer: Customer, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteCustomer(customer)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteCustomer) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/customers/${deleteCustomer.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error('Failed to delete customer')
      }
      setCustomers(customers.filter(c => c.id !== deleteCustomer.id))
    } catch (error) {
      console.error('Error deleting customer:', error)
    } finally {
      setIsDeleting(false)
      setDeleteCustomer(null)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.primaryContact?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !typeFilter || customer.type === typeFilter
    return matchesSearch && matchesType
  })

  const clearFilters = () => {
    setTypeFilter('')
  }

  const activeFiltersCount = typeFilter ? 1 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-2">
            Manage salons, distributors, and partners
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search customers..."
              className="!pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative" ref={filterRef}>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-lg border bg-white shadow-lg p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="SALON">Salon</option>
                      <option value="DISTRIBUTOR">Distributor</option>
                      <option value="CORPORATE">Corporate</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Customers Table */}
      {loading ? (
        <Card className="p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading customers...</p>
        </Card>
      ) : filteredCustomers.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
              <UsersIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No customers found' : 'No customers yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {searchQuery ? 'Try a different search term' : 'Start building your customer database'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Customer
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Customer</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Brands</TableHead>
                <TableHead className="text-center">Contact</TableHead>
                <TableHead className="text-center">Added</TableHead>
                <TableHead className="w-[80px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/customers/${customer.id}`)}
                >
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-sm">
                          {customer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <div className="font-medium">{customer.name}</div>
                        {customer.primaryContact && (
                          <div className="text-sm text-muted-foreground">
                            {customer.primaryContact}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getCustomerTypeVariant(customer.type)}>
                      {customer.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {customer.brands && customer.brands.length > 0 ? (
                      <div className="flex flex-wrap justify-center gap-1 max-w-[200px] mx-auto">
                        {customer.brands.slice(0, 3).map((brand) => (
                          <Badge
                            key={brand}
                            variant="secondary"
                            className="text-xs px-2 py-0.5"
                          >
                            {brand}
                          </Badge>
                        ))}
                        {customer.brands.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0.5"
                          >
                            +{customer.brands.length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {customer.email && (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="truncate max-w-[200px]">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    )}
                    {!customer.email && !customer.phone && '-'}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {formatDate(customer.createdAt)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditClick(customer, e)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteClick(customer, e)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <CreateCustomerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCustomerCreated={handleCustomerCreated}
      />

      {editingCustomer && (
        <CreateCustomerModal
          isOpen={!!editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onCustomerCreated={handleCustomerUpdated}
          initialData={editingCustomer}
          isEditing={true}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteCustomer(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Delete Customer</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-medium">&quot;{deleteCustomer.name}&quot;</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteCustomer(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
