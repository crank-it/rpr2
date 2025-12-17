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

export interface ProjectAsset {
  label: string
  url: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  status: 'DRAFT' | 'START' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  customer_id: string | null
  due_date: string | null
  owner: string | null
  assignees: string[] // User IDs
  category_ids: string[] // Category IDs
  assets: ProjectAsset[]
  customFieldValues: Record<string, string | string[]>
  created_at: string
  updated_at: string
  completed_at: string | null
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
  entity_type: 'CUSTOMER' | 'PROJECT' | 'CAMPAIGN' | 'ASSET' | 'TASK'
  entity_id: string
  author_id: string | null
  author_name: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface User {
  id: string
  name: string | null
  email: string | null
  role: 'superadmin' | 'admin' | 'user'
  status: 'pending' | 'active' | 'rejected' | 'deactivated'
  image_url: string | null
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string | null
}

export interface CustomFieldDefinition {
  id: string
  name: string
  type: 'text' | 'textarea' | 'url' | 'date' | 'user' | 'number' | 'checkbox' | 'email' | 'dropdown' | 'multiselect'
  options?: string[] // Only for dropdown and multiselect
  required: boolean
  sortOrder: number
}

export interface ProjectCategory {
  id: string
  name: string
  description: string | null
  color: string
  customFields: CustomFieldDefinition[]
  created_at: string
  updated_at: string
}

export interface TaskTemplate {
  id: string
  category_id: string
  title: string
  details: string | null
  assignee_ids: string[]
  target_days_offset: number
  status: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  details: string | null
  attachment: string | null
  assignee_ids: string[]
  target_date: string | null
  status: 'DRAFT' | 'START' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED' | 'COMPLETED'
  created_at: string
  updated_at: string
  completed_at: string | null
  created_from_template_id: string | null
}
