# RPR Flow - Project Context & Implementation Summary

**Project Path:** `/Users/ben/Documents/Development Files/rpr-flow-16.12`
**Supabase Project ID:** `nbcprvkbjfhwqfibfjih`
**Live URL:** http://localhost:3000

---

## 🎯 Project Overview

RPR Flow is a project management system built with Next.js 16, Supabase, and Clerk authentication. The application manages projects, tasks, customers, categories, and team collaboration.

---

## 📊 Database Schema

### Core Tables

**users**
- Standard Clerk user sync
- Fields: id, name, email, role, status, created_at

**customers**
- id, name, type, email, phone, website, status

**projects**
- id, title, description
- status: `DRAFT | START | IN_PROGRESS | REVIEW | APPROVED | COMPLETED`
- priority: `LOW | MEDIUM | HIGH | URGENT`
- customer_id (FK)
- due_date, owner, assignees (TEXT[])
- category_ids (TEXT[])
- assets (JSONB) - Array of {label, url}
- created_at, updated_at, completed_at

**project_categories**
- id, name, description, color
- Seeded with 6 example categories

**task_templates**
- id, category_id (FK), title, details
- assignee_ids (TEXT[])
- target_days_offset, status, sort_order

**tasks**
- id, project_id (FK), title, details, attachment
- assignee_ids (TEXT[])
- target_date, status
- created_at, updated_at, completed_at
- created_from_template_id (FK)

**comments**
- id, entity_type, entity_id
- author, author_email, content
- parent_id (for replies)
- reactions (JSONB), deleted_at
- entity_type: `CUSTOMER | PROJECT | CAMPAIGN | ASSET | TASK`

**activities**
- id, type, description, project_id, performed_by
- created_at

---

## 🔑 Key Features Implemented

### 1. **Multi-Assignee Projects**
- Projects can have multiple team members assigned
- Uses TEXT[] array in database
- MultiSelect component in forms
- UserAvatar component displays assignees

### 2. **Project Categories with Templates**
- Categories can have task templates
- Auto-create tasks when category is assigned to project
- Templates include: title, details, assignee_ids, target_days_offset
- Managed in Settings → Project Categories tab

### 3. **Dropbox Asset Links**
- Multiple asset links per project
- Each asset has: label + URL
- Stored as JSONB array
- Dynamic add/remove in CreateProjectModal

### 4. **Complete Task Management**
- Tasks belong to projects
- Fields: title, details, attachment, assignees, target_date, status
- Each task can have comment threads
- Auto-created from category templates

### 5. **Admin Comment Deletion**
- Admins/superadmins can delete any comment
- Soft delete (deleted_at field)
- Trash icon appears only for admins
- Works on both comments and replies

### 6. **Project Status Flow**
- DRAFT → START → IN_PROGRESS → REVIEW → APPROVED → COMPLETED
- START status added between DRAFT and IN_PROGRESS
- Auto-sets completed_at when status = COMPLETED

---

## 📁 Key Files & Components

### API Routes

```
/app/api/
├── projects/
│   ├── route.ts (GET, POST)
│   └── [id]/route.ts (GET, PATCH, DELETE)
├── project-categories/
│   ├── route.ts (GET, POST)
│   └── [id]/route.ts (GET, PATCH, DELETE)
├── task-templates/
│   ├── route.ts (GET, POST)
│   └── [id]/route.ts (PATCH, DELETE)
├── tasks/
│   ├── route.ts (GET, POST)
│   ├── [id]/route.ts (GET, PATCH, DELETE)
│   └── create-from-templates/route.ts (POST)
├── comments/
│   └── route.ts (GET, POST, DELETE)
├── users/
│   ├── route.ts (GET)
│   └── me/route.ts (GET - returns current user with role)
├── seed-demo/
│   └── route.ts (POST - seeds demo data)
└── inspect-data/
    └── route.ts (GET - shows current data counts)
```

### Components

```
/components/
├── common/
│   └── UserAvatar.tsx - Displays user by ID with avatar/initials
├── projects/
│   └── CreateProjectModal.tsx - Create/edit projects with all fields
├── comments/
│   └── CommentThread.tsx - Comments with admin delete
└── ui/
    ├── modal.tsx, button.tsx, card.tsx, etc.
    ├── multi-select.tsx - For multiple selections
    └── tabs.tsx - Tab navigation
```

### Pages

```
/app/
├── projects/
│   ├── page.tsx - Projects list
│   └── [id]/page.tsx - Project detail with tasks, comments, assets
├── settings/
│   └── page.tsx - Tabbed: General Settings | Project Categories
└── seed-demo/
    └── page.tsx - Database inspector & demo data seeder
```

### Utilities

```
/lib/
├── utils.ts - cn() helper + formatDate()
└── supabase.ts - Type definitions
```

---

## 🔄 Template Task Auto-Creation

### How It Works:

1. **Category has templates** in `task_templates` table
2. **User assigns category** to project (in CreateProjectModal or Edit)
3. **API detects new categories** (compares with existing category_ids)
4. **Calls `/api/tasks/create-from-templates`** with projectId + new categoryIds
5. **Creates tasks** with:
   - template.title → task.title
   - template.details → task.details
   - template.assignee_ids → task.assignee_ids
   - project.created_at + template.target_days_offset → task.target_date
   - template.status → task.status

### Files Involved:
- `/app/api/projects/route.ts` (POST) - triggers after create
- `/app/api/projects/[id]/route.ts` (PATCH) - triggers on category change
- `/app/api/tasks/create-from-templates/route.ts` - creates the tasks

---

## 🎨 Current UI/UX State

### Design System
- Tailwind CSS with custom luxury styling
- Color palette: Teal primary (#14b8a6), Pink accents (rgb(247,141,208))
- Shadcn/ui components with default neutral theme
- Consistent card-based layouts

### Navigation
- Top nav with Dashboard, Projects, Customers, Campaigns, Assets, Settings
- Breadcrumbs on detail pages
- Back buttons with ArrowLeft icon

### Forms
- CreateProjectModal used for both create and edit
- Multi-step feel with clear sections
- Validation on required fields
- Loading states with spinners

### Lists
- Grid/card layouts for projects
- Status and priority badges with color coding
- Avatar groups for assignees
- Hover states and actions

---

## 🔐 Authentication & Permissions

### Clerk Integration
- Sign-in required for all pages
- User sync to Supabase users table
- currentUser() in API routes

### Role-Based Access
- Roles: `user | admin | superadmin`
- Admin features:
  - Delete comments
  - Manage all projects
  - Access to Settings → Project Categories

### Authorization Pattern
```typescript
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single()

if (!['admin', 'superadmin'].includes(userData?.role)) {
  return error 403
}
```

---

## 📦 Demo Data

### Seed Script
- **URL:** `/seed-demo`
- **API:** `POST /api/seed-demo`
- Creates:
  - 3 customers (Acme, TechStart, Global Retail)
  - 6 projects (all statuses represented)
  - 5+ tasks
  - Sample comments
  - Activity logs

### Inspect API
- **API:** `GET /api/inspect-data`
- Returns counts of all entities
- Used by seed-demo page to show current state

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Clerk
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Language:** TypeScript
- **Package Manager:** npm

### Key Dependencies
- `@supabase/supabase-js` - Database client
- `@clerk/nextjs` - Authentication
- `@radix-ui/react-*` - UI primitives
- `lucide-react` - Icons
- `clsx` + `tailwind-merge` - Styling utilities

---

## 🔧 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://nbcprvkbjfhwqfibfjih.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (required for API routes)
```

---

## 🚀 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Seed demo data
# Visit http://localhost:3000/seed-demo
```

---

## 📝 Conventions

### Naming
- **Database:** snake_case (due_date, customer_id)
- **API Responses:** camelCase (dueDate, customerId)
- **React:** PascalCase components, camelCase props

### Data Flow
1. Client → API Route (camelCase)
2. API Route → Supabase (convert to snake_case)
3. Supabase Response → API (convert to camelCase)
4. API → Client (camelCase)

### File Structure
- API routes in `/app/api/`
- Pages in `/app/`
- Components in `/components/`
- Utils in `/lib/`
- Types alongside usage or in `/lib/supabase.ts`

---

## 🎯 Key Implementation Decisions

1. **Multi-assignee as TEXT[]** - Simple, works with Supabase, easy to query
2. **Assets as JSONB** - Flexible for {label, url} pairs
3. **Soft delete comments** - deleted_at instead of hard delete
4. **Template tasks** - Created at assignment time, not dynamically
5. **Status includes START** - Client requirement for workflow clarity
6. **Category reassignment** - Required when deleting categories with projects
7. **Admin role check** - Server-side in API routes, client shows/hides UI

---

## 🐛 Known Considerations

1. **No file uploads yet** - Assets are Dropbox links only
2. **No real-time updates** - Page refresh needed to see changes
3. **No task detail page** - Tasks shown inline on project page
4. **No batch operations** - Delete/update one at a time
5. **Template updates don't affect existing tasks** - By design

---

## 📚 Next Steps for UX Cleanup

This is where you left off - ready to refine the UI/UX with:
- Consistent spacing and layouts
- Better visual hierarchy
- Improved form flows
- Enhanced mobile responsiveness
- Polish on interactions and animations
- Refinement of color scheme and typography

All functionality is working - now focus on making it beautiful! 🎨
