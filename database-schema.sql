-- RPR Flow Database Schema
-- Run this in Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('superadmin', 'admin', 'user')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'deactivated')),
  image_url TEXT,
  requested_role TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  status TEXT DEFAULT 'active',
  primary_contact TEXT,
  address TEXT,
  brands TEXT[] DEFAULT '{}',
  spending_tier TEXT,
  annual_spend NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECT CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS project_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  custom_fields JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'START', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'COMPLETED')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  due_date TIMESTAMPTZ,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  owner TEXT,
  assignees TEXT[] DEFAULT '{}',
  category_ids TEXT[] DEFAULT '{}',
  assets JSONB DEFAULT '[]',
  custom_field_values JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- TASK TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES project_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  details TEXT,
  assignee_ids TEXT[] DEFAULT '{}',
  target_days_offset INTEGER DEFAULT 0,
  status TEXT DEFAULT 'DRAFT',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  details TEXT,
  attachment TEXT,
  assignee_ids TEXT[] DEFAULT '{}',
  target_date TIMESTAMPTZ,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'START', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'COMPLETED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_from_template_id UUID REFERENCES task_templates(id) ON DELETE SET NULL
);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('CUSTOMER', 'PROJECT', 'CAMPAIGN', 'ASSET', 'TASK')),
  entity_id UUID NOT NULL,
  author TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reactions JSONB DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACTIVITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  campaign_id UUID,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  performed_by TEXT, -- Clerk user ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'PAUSED')),
  audience TEXT CHECK (audience IN ('B2B', 'B2C', 'BOTH')),
  launch_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  budget NUMERIC,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ASSETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('IMAGE', 'VIDEO', 'DOCUMENT', 'PDF', 'DESIGN')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  uploaded_by TEXT,
  downloads INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_activities_project ON activities(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_templates_category ON task_templates(category_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Optional
-- Enable if you want RLS policies
-- ============================================
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SEED DEFAULT PROJECT CATEGORIES (Optional)
-- ============================================
INSERT INTO project_categories (name, description, color, custom_fields) VALUES
  ('Marketing Campaign', 'Marketing and promotional campaigns', '#ef4444', '[]'),
  ('Video Production', 'Video content creation projects', '#f97316', '[]'),
  ('Design Project', 'Graphic design and branding work', '#eab308', '[]'),
  ('Social Media', 'Social media content and management', '#22c55e', '[]'),
  ('Event', 'Event planning and execution', '#3b82f6', '[]'),
  ('Training', 'Training and educational content', '#8b5cf6', '[]')
ON CONFLICT DO NOTHING;

-- ============================================
-- GRANT PERMISSIONS (for service role)
-- ============================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
