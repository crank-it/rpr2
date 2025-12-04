# RPR Flow - Developer Handoff Guide

## Project Overview

RPR Flow is an operations hub for RPR Haircare built with Next.js 16, React 19, and Supabase. It provides project management, asset tracking, campaign management, and customer relationship tools.

**Live URL:** https://rpr-flow-d59xfsjh8-outer-edge.vercel.app

---

## Current State

### What's Complete
- Full Next.js app with App Router
- Dashboard with stats and quick actions
- Projects, Assets, Campaigns, Customers pages with CRUD operations
- Reports page (placeholder)
- Training resources page (placeholder)
- Settings page (placeholder)
- Supabase database integration
- Email/password authentication
- Protected routes via middleware
- User menu with sign out functionality
- Responsive sidebar navigation
- Bug report modal

### Tech Stack
- **Framework:** Next.js 16.0.3 with App Router & Turbopack
- **UI:** React 19.2.0, Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Deployment:** Vercel

---

## Next Steps to Bring This to Life

### 1. Supabase Configuration

#### Enable Email Auth (if not already done)
1. Go to Supabase Dashboard > Authentication > Providers
2. Ensure "Email" provider is enabled
3. Configure email templates under Authentication > Email Templates

#### Disable Email Confirmation for Development (Optional)
1. Go to Authentication > Settings
2. Toggle off "Enable email confirmations" for easier testing
3. Re-enable for production

#### Set Up Row Level Security (RLS)
Currently using permissive policies. For production, implement proper RLS:

```sql
-- Example: Users can only see their own data
CREATE POLICY "Users can view own customers"
ON customers FOR SELECT
USING (auth.uid() = created_by);

-- Add created_by column to tables
ALTER TABLE customers ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE projects ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE campaigns ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE assets ADD COLUMN created_by UUID REFERENCES auth.users(id);
```

### 2. Environment Variables

Ensure these are set in Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://nbcprvkbjfhwqfibfjih.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

For local development, these are in `.env` (not committed to git).

### 3. Database Schema Enhancements

#### Add Missing Tables
```sql
-- Comments table for projects/assets
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  project_id UUID REFERENCES projects(id),
  asset_id UUID REFERENCES assets(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log for dashboard
CREATE TABLE activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Add Relationships
```sql
-- Link assets to projects
ALTER TABLE assets ADD COLUMN project_id UUID REFERENCES projects(id);

-- Link campaigns to projects
ALTER TABLE campaigns ADD COLUMN project_id UUID REFERENCES projects(id);
```

### 4. File Storage Setup

#### Configure Supabase Storage for Assets
1. Go to Supabase Dashboard > Storage
2. Create a bucket called `assets`
3. Set up policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');

-- Allow authenticated users to view
CREATE POLICY "Authenticated users can view"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'assets');
```

#### Update Asset Upload Modal
Modify `/components/assets/UploadAssetModal.tsx` to actually upload files:

```typescript
const uploadFile = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from('assets')
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('assets')
    .getPublicUrl(fileName)

  return publicUrl
}
```

### 5. Feature Completions

#### Dashboard
- [ ] Fetch real stats from database (count of projects, assets, etc.)
- [ ] Fetch recent activity from activity_log table
- [ ] Add date range filters

#### Projects
- [ ] Add project detail page functionality (currently placeholder)
- [ ] Implement project timeline/milestones
- [ ] Add team member assignment
- [ ] Connect assets to projects

#### Assets
- [ ] Implement actual file upload to Supabase Storage
- [ ] Add image preview/thumbnails
- [ ] Add download functionality
- [ ] Implement asset versioning

#### Campaigns
- [ ] Add campaign calendar view
- [ ] Implement campaign analytics
- [ ] Add email/notification integration

#### Customers
- [ ] Add customer activity history
- [ ] Implement customer tags/segments
- [ ] Add customer notes/communications log

#### Reports
- [ ] Build actual reporting dashboards
- [ ] Add chart visualizations (recommend Recharts or Chart.js)
- [ ] Export to PDF/CSV functionality

#### Training
- [ ] Add video embedding support
- [ ] Implement progress tracking
- [ ] Add quizzes/assessments

#### Settings
- [ ] User profile management
- [ ] Team/organization settings
- [ ] Notification preferences
- [ ] Integration settings

### 6. User Roles & Permissions (Future)

If you need different access levels:

```sql
-- Add role to user profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 7. Mobile Responsiveness

- [ ] Implement mobile sidebar (hamburger menu functionality)
- [ ] Test and fix responsive layouts on all pages
- [ ] Add touch-friendly interactions

### 8. Testing

- [ ] Add unit tests with Jest/Vitest
- [ ] Add E2E tests with Playwright or Cypress
- [ ] Test authentication flows
- [ ] Test CRUD operations

### 9. Performance & SEO

- [ ] Add metadata to all pages
- [ ] Implement loading states/skeletons
- [ ] Add error boundaries
- [ ] Optimize images with next/image
- [ ] Add sitemap (if needed for public pages)

### 10. Deployment Checklist

Before going live:
- [ ] Set up custom domain in Vercel
- [ ] Configure environment variables in Vercel
- [ ] Enable email confirmation in Supabase
- [ ] Set up proper RLS policies
- [ ] Test all auth flows in production
- [ ] Set up error monitoring (Sentry recommended)
- [ ] Configure analytics (Vercel Analytics or Google Analytics)

---

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npx vercel --prod
```

---

## File Structure

```
rpr-flow/
├── app/
│   ├── api/              # API routes
│   ├── assets/           # Assets pages
│   ├── campaigns/        # Campaigns pages
│   ├── customers/        # Customers pages
│   ├── login/            # Login page
│   ├── projects/         # Projects pages
│   ├── reports/          # Reports page
│   ├── settings/         # Settings page
│   ├── signup/           # Signup page
│   ├── training/         # Training page
│   ├── layout.tsx        # Root layout with sidebar
│   ├── page.tsx          # Dashboard
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # Reusable UI components
│   ├── assets/           # Asset-specific components
│   ├── campaigns/        # Campaign-specific components
│   ├── customers/        # Customer-specific components
│   ├── projects/         # Project-specific components
│   └── BugReportModal.tsx
├── contexts/
│   └── AuthContext.tsx   # Authentication context
├── lib/
│   ├── supabase.ts       # Supabase client
│   ├── supabase-browser.ts # Browser auth client
│   ├── supabase-server.ts  # Server auth client
│   └── utils.ts          # Utility functions
├── middleware.ts         # Route protection
└── .env                  # Environment variables (not in git)
```

---

## Support

For questions about the codebase, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

*Last updated: December 2024*
