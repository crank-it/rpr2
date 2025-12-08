'use client'

import { Plus, Users as UsersIcon, Search, Filter, Mail, Phone, FolderOpen, Pencil } from 'lucide-react'
import { useState, useEffect } from 'react'
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

  const handleCustomerCreated = async (newCustomer: Partial<Customer>) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustomer.name,
          type: newCustomer.type || 'SALON',
          email: newCustomer.email || null,
          phone: newCustomer.phone || null,
          primaryContact: newCustomer.primaryContact || null,
          tags: newCustomer.tags || []
        })
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

  const handleCustomerUpdated = async (updatedCustomer: Partial<Customer>) => {
    if (!editingCustomer) return

    try {
      const response = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedCustomer.name,
          type: updatedCustomer.type,
          email: updatedCustomer.email,
          phone: updatedCustomer.phone,
          primaryContact: updatedCustomer.primaryContact,
          tags: updatedCustomer.tags
        })
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

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.primaryContact?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search customers..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
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
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/customers/${customer.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-sm">
                          {customer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        {customer.primaryContact && (
                          <div className="text-sm text-muted-foreground">
                            {customer.primaryContact}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCustomerTypeVariant(customer.type)}>
                      {customer.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {customer.tags && customer.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {customer.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs px-2 py-0.5"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {customer.tags.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0.5"
                          >
                            +{customer.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="truncate max-w-[200px]">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    )}
                    {!customer.email && !customer.phone && '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(customer.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditClick(customer, e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
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
    </div>
  )
}
