import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Customer {
  id: string
  name: string
  type: 'SALON' | 'DISTRIBUTOR' | 'CORPORATE' | 'VIP'
  email: string | null
  phone: string | null
  primary_contact: string | null
  address: string | null
  website: string | null
  brands: string[]
  spending_tier: 'TOP_1' | 'TOP_3' | 'TOP_10' | null
  annual_spend: number | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  status: 'DRAFT' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  customer_id: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  name: string
  description: string | null
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'PAUSED'
  audience: 'B2B' | 'B2C' | 'BOTH'
  launch_date: string | null
  end_date: string | null
  budget: number | null
  progress: number
  created_at: string
  updated_at: string
}

export interface Asset {
  id: string
  name: string
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'PDF' | 'DESIGN'
  url: string
  thumbnail_url: string | null
  description: string | null
  tags: string[]
  file_size: number | null
  width: number | null
  height: number | null
  duration: number | null
  uploaded_by: string
  downloads: number
  views: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  content: string
  entity_type: 'CUSTOMER' | 'PROJECT' | 'CAMPAIGN' | 'ASSET'
  entity_id: string
  author_name: string
  created_at: string
  updated_at: string
}
