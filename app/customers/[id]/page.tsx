'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, User, Calendar, Building2, FolderOpen, Activity, Pencil } from 'lucide-react'
import { CommentThread } from '@/components/comments/CommentThread'
import { CreateCustomerModal } from '@/components/customers/CreateCustomerModal'
import { formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Customer {
  id: string
  name: string
  type: string
  email: string | null
  phone: string | null
  primary_contact: string | null
  address: string | null
  website: string | null
  brands: string[]
  spending_tier: 'TOP_1' | 'TOP_3' | 'TOP_10' | null
  annual_spend: number | null
  created_at: string
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

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params.id as string
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchCustomer = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (error) {
      console.error('Error fetching customer:', error)
    } else {
      setCustomer(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCustomer()
  }, [customerId])

  const handleCustomerUpdated = async (updatedCustomer: any) => {
    const { data, error } = await supabase
      .from('customers')
      .update({
        name: updatedCustomer.name,
        type: updatedCustomer.type,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        primary_contact: updatedCustomer.primary_contact,
        address: updatedCustomer.address,
        website: updatedCustomer.website,
        brands: updatedCustomer.brands,
        spending_tier: updatedCustomer.spending_tier,
        annual_spend: updatedCustomer.annual_spend
      })
      .eq('id', customerId)
      .select()
      .single()

    if (error) {
      console.error('Error updating customer:', error)
    } else if (data) {
      setCustomer(data)
    }
    setIsEditModalOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold">Customer not found</h2>
        <Link href="/customers" className="text-teal-600 hover:underline mt-2 inline-block">
          Back to Customers
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">{customer.name}</h1>
            <div className="flex items-center gap-3">
              <Badge variant={getCustomerTypeVariant(customer.type)}>
                {customer.type}
              </Badge>
              {customer.primary_contact && (
                <span className="text-sm text-muted-foreground">
                  Contact: {customer.primary_contact}
                </span>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Projects */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Active and completed projects</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects">View All →</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground text-center py-8">
              No projects yet
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.primary_contact && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Primary Contact
                  </p>
                  <p className="text-sm font-medium">{customer.primary_contact}</p>
                </div>
                <Separator />
              </>
            )}
            {customer.email && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-sm font-medium text-gray-900 hover:underline"
                  >
                    {customer.email}
                  </a>
                </div>
                <Separator />
              </>
            )}
            {customer.phone && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </p>
                  <a
                    href={`tel:${customer.phone}`}
                    className="text-sm font-medium text-gray-900"
                  >
                    {customer.phone}
                  </a>
                </div>
                <Separator />
              </>
            )}
            {customer.address && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Address
                  </p>
                  <p className="text-sm font-medium">{customer.address}</p>
                </div>
                <Separator />
              </>
            )}
            {customer.website && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Website</p>
                  <a
                    href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:underline"
                  >
                    {customer.website}
                  </a>
                </div>
                <Separator />
              </>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Customer Since
              </p>
              <p className="text-sm font-medium">{formatDate(customer.created_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brands */}
      {customer.brands && customer.brands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Brands Carried</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {customer.brands.map((brand) => (
                <Badge key={brand} variant="secondary" className="px-3 py-1">
                  {brand}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Communication */}
      <div>
        <CommentThread entityType="CUSTOMER" entityId={customer.id} />
      </div>

      <CreateCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onCustomerCreated={handleCustomerUpdated}
        initialData={customer}
        isEditing={true}
      />
    </div>
  )
}
