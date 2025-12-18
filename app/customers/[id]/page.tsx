'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Building2, FolderOpen, Pencil, Globe, DollarSign, Award, User, Plus } from 'lucide-react'
import { CommentThread } from '@/components/comments/CommentThread'
import { CreateCustomerModal } from '@/components/customers/CreateCustomerModal'
import { formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

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

interface Project {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  created_at: string
}

const formatCustomerType = (type: string) => {
  return type.charAt(0) + type.slice(1).toLowerCase()
}

const formatSpendingTier = (tier: string | null) => {
  if (!tier) return null
  const tiers: Record<string, string> = {
    'TOP_1': 'Top 1%',
    'TOP_3': 'Top 3%',
    'TOP_10': 'Top 10%'
  }
  return tiers[tier] || tier
}

const formatCurrency = (amount: number | null) => {
  if (!amount) return null
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatStatus = (status: string) => {
  return status.replace('_', ' ').charAt(0) + status.replace('_', ' ').slice(1).toLowerCase()
}

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params.id as string
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
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

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
    } else {
      setProjects(data || [])
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchCustomer()
    fetchProjects()
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
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-foreground border-r-transparent" />
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="text-center py-24">
            <h2 className="text-xl font-medium text-foreground mb-2">Customer not found</h2>
            <Link href="/customers" className="text-sm text-primary hover:text-primary/80 transition-colors">
              Back to Customers
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* Back link */}
        <Link
          href="/customers"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-3">
            <h1 className="text-5xl font-normal text-foreground tracking-tight">
              {customer.name}
            </h1>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatCustomerType(customer.type)}
            {customer.primary_contact && ` · ${customer.primary_contact}`}
            {` · Since ${formatDate(customer.created_at)}`}
          </p>
        </div>

        {/* Contact Details Card */}
        <div className="mb-12">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Contact
          </h2>
          <div className="rounded-xl border border-border bg-card p-6 space-y-0">
            {/* Primary Contact */}
            {customer.primary_contact && (
              <>
                <div className="py-4">
                  <div className="flex items-baseline justify-between gap-8">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-foreground mb-1">
                        Primary Contact
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {customer.primary_contact}
                      </p>
                    </div>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="h-px bg-border" />
              </>
            )}

            {/* Email */}
            {customer.email && (
              <>
                <div className="py-4">
                  <div className="flex items-baseline justify-between gap-8">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-foreground mb-1">
                        Email
                      </h3>
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        {customer.email}
                      </a>
                    </div>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="h-px bg-border" />
              </>
            )}

            {/* Phone */}
            {customer.phone && (
              <>
                <div className="py-4">
                  <div className="flex items-baseline justify-between gap-8">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-foreground mb-1">
                        Phone
                      </h3>
                      <a
                        href={`tel:${customer.phone}`}
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        {customer.phone}
                      </a>
                    </div>
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="h-px bg-border" />
              </>
            )}

            {/* Address */}
            {customer.address && (
              <>
                <div className="py-4">
                  <div className="flex items-baseline justify-between gap-8">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-foreground mb-1">
                        Address
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {customer.address}
                      </p>
                    </div>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="h-px bg-border" />
              </>
            )}

            {/* Website */}
            {customer.website && (
              <div className="py-4">
                <div className="flex items-baseline justify-between gap-8">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-foreground mb-1">
                      Website
                    </h3>
                    <a
                      href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      {customer.website}
                    </a>
                  </div>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Show message if no contact info */}
            {!customer.email && !customer.phone && !customer.address && !customer.website && !customer.primary_contact && (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">No contact information</p>
              </div>
            )}
          </div>
        </div>

        {/* Business Details Card */}
        {(customer.spending_tier || customer.annual_spend || (customer.brands && customer.brands.length > 0)) && (
          <div className="mb-12">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Business
            </h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-0">
              {/* Spending Tier */}
              {customer.spending_tier && (
                <>
                  <div className="py-4">
                    <div className="flex items-baseline justify-between gap-8">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-foreground mb-1">
                          Spending Tier
                        </h3>
                        <p className="text-sm text-primary font-medium">
                          {formatSpendingTier(customer.spending_tier)}
                        </p>
                      </div>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                </>
              )}

              {/* Annual Spend */}
              {customer.annual_spend && (
                <>
                  <div className="py-4">
                    <div className="flex items-baseline justify-between gap-8">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-foreground mb-1">
                          Annual Spend
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(customer.annual_spend)}
                        </p>
                      </div>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  {customer.brands && customer.brands.length > 0 && <div className="h-px bg-border" />}
                </>
              )}

              {/* Brands */}
              {customer.brands && customer.brands.length > 0 && (
                <div className="py-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-foreground mb-3">
                      Brands Carried
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {customer.brands.map((brand) => (
                        <span
                          key={brand}
                          className="px-3 py-1.5 text-sm rounded-full bg-primary/10 text-primary"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects Card */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Projects ({projects.length})
            </h2>
            {projects.length > 5 && (
              <Link
                href={`/projects?customer=${customerId}`}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View All
              </Link>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-0">
            {projects.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">No projects yet</p>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create a project
                </Link>
              </div>
            ) : (
              <>
                {projects.slice(0, 5).map((project, index) => (
                  <div key={project.id}>
                    <Link
                      href={`/projects/${project.id}`}
                      className="block py-4 transition-opacity hover:opacity-60"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <FolderOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-base font-medium text-foreground truncate">{project.title}</p>
                            {project.due_date && (
                              <p className="text-sm text-muted-foreground">
                                Due {formatDate(project.due_date)}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${
                          project.status === 'COMPLETED'
                            ? 'bg-green-500/10 text-green-600'
                            : project.status === 'IN_PROGRESS'
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {formatStatus(project.status)}
                        </span>
                      </div>
                    </Link>
                    {index < Math.min(projects.length, 5) - 1 && (
                      <div className="h-px bg-border" />
                    )}
                  </div>
                ))}
                {projects.length > 5 && (
                  <div className="pt-4 text-center border-t border-border mt-4">
                    <Link
                      href={`/projects?customer=${customerId}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      +{projects.length - 5} more projects
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Notes & Communication */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Notes & Communication
          </h2>
          <div className="rounded-xl border border-border bg-card p-6">
            <CommentThread entityType="CUSTOMER" entityId={customer.id} />
          </div>
        </div>

      </div>

      {/* Edit Modal */}
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
