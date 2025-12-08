# User Management System Guide

A comprehensive guide to the user management interface and features. This document covers functionality and structure - adapt styling to match your platform.

---

## Table of Contents

1. [Overview](#overview)
2. [User Management Page Layout](#user-management-page-layout)
3. [Pending Approvals Section](#pending-approvals-section)
4. [Users Table Section](#users-table-section)
5. [Role Descriptions Section](#role-descriptions-section)
6. [Executive Assistant View-Only Mode](#executive-assistant-view-only-mode)
7. [Rejected Users Section](#rejected-users-section)
8. [User Status Pages](#user-status-pages)
9. [User Flow Diagrams](#user-flow-diagrams)
10. [Admin Actions Reference](#admin-actions-reference)
11. [Data Structure](#data-structure)
12. [Icons Used](#icons-used)

---

## Overview

The User Management system provides administrators with tools to:
- Approve or reject new user registrations
- Manage user roles (Superadmin / Admin / Executive Assistant / Client)
- Activate or deactivate user accounts
- View all users organized by status

### Access Control

| Role | User Management Access |
|------|------------------------|
| **Superadmin** | Full access - can do everything with no restrictions |
| **Admin** | Full access - can approve, reject, change roles and status |
| **Executive Assistant** | View-only access - can see user list but cannot make changes |
| **Client** | No access - cannot view User Management page |

Access is verified through:
- Database `role` field
- Clerk public metadata
- Predefined admin email list

Users without sufficient permissions see an "Access Denied" message with a shield icon.

---

## User Management Page Layout

The page is divided into four main sections:

```
┌─────────────────────────────────────────────────────┐
│  HEADER: "User Management"                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SECTION 1: Pending Approvals                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ Pending user cards with Approve/Reject      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  SECTION 2: Users Table                             │
│  ┌─────────────────────────────────────────────┐   │
│  │ Table of active/deactivated users           │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  SECTION 3: Role Descriptions                       │
│  ┌────────────┐ ┌───────┐ ┌─────────┐ ┌────────┐  │
│  │ Superadmin │ │ Admin │ │ Exec.   │ │ Client │  │
│  │    Card    │ │ Card  │ │ Assist. │ │  Card  │  │
│  └────────────┘ └───────┘ └─────────┘ └────────┘  │
│                                                     │
│  SECTION 4: Rejected Users (Collapsible)            │
│  ┌─────────────────────────────────────────────┐   │
│  │ List of rejected users                      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Pending Approvals Section

### Header
- Title: "Pending Approvals"
- Badge showing count of pending users (e.g., "3")

### Empty State
When no pending users:
- Checkmark icon
- Text: "No pending approvals"
- Muted description: "All user requests have been processed"

### Pending User Cards

Each pending user displays as a card:

```
┌─────────────────────────────────────────────────────────────┐
│  [Avatar]  John Smith                                       │
│            john@example.com                                 │
│            Registered: Jan 15, 2025                         │
│                                                             │
│            [Approve Button]  [Reject Button]                │
└─────────────────────────────────────────────────────────────┘
```

#### Card Elements:
| Element | Description |
|---------|-------------|
| Avatar | User profile image or initials fallback |
| Name | User's full name (bold) |
| Email | User's email address (muted text) |
| Registration Date | "Registered: [formatted date]" |
| Approve Button | Green/success color, triggers approval |
| Reject Button | Red/destructive color, triggers rejection |

#### Button States:
- **Default**: Clickable with hover effect
- **Loading**: Disabled with spinner, shows "Approving..." or "Rejecting..."
- **After Action**: Card removed from list, user moves to appropriate section

---

## Users Table Section

### Header
- Title: "Users"
- Subtitle: "Manage team members and their roles"

### Table Structure

| Column | Content | Notes |
|--------|---------|-------|
| User | Avatar + Name | Shows "You" badge for current user, Crown icon for platform owner |
| Email | Email with mail icon | - |
| Role | Role badge | Superadmin / Admin / Executive Assistant / Client |
| Status | Dropdown selector | Active or Deactivated |
| Joined | Formatted date | Creation date |
| Actions | Role dropdown | Change role options (disabled for Executive Assistant view) |

### User Column Details

```
┌──────────────────────────────────────┐
│ [Avatar]  Jane Doe                   │
│           (You)          ← if current user
│           Platform Owner ← if owner (with crown icon)
└──────────────────────────────────────┘
```

### Role Badge Styles

| Role | Appearance |
|------|------------|
| Superadmin | Purple/violet background, crown icon, "Superadmin" text |
| Admin | Red/primary background, shield icon, "Admin" text |
| Executive Assistant | Blue background, briefcase icon, "Executive Assistant" text |
| Client | Gray/muted background, user icon, "Client" text |

### Status Dropdown

```
┌─────────────────┐
│ Active        ▼ │
├─────────────────┤
│ Active          │  ← Green indicator
│ Deactivated     │  ← Red indicator
└─────────────────┘
```

**Disabled when:**
- Viewing platform owner row
- Viewing your own row
- User is Executive Assistant (view-only mode)

### Actions Column - Role Dropdown

```
┌───────────────────────┐
│ Change Role         ▼ │
├───────────────────────┤
│ Superadmin            │  ← Only visible to Superadmin
│ Admin                 │
│ Executive Assistant   │
│ Client                │
└───────────────────────┘
```

**Disabled when:**
- Platform owner (shows "Platform Owner" text instead)
- Current logged-in user (shows "Current User" text instead)
- User is Executive Assistant (view-only access)

**Role Assignment Rules:**
- Only **Superadmin** can assign/remove the Superadmin role
- **Admin** can assign Admin, Executive Assistant, or Client roles
- **Executive Assistant** cannot change any roles (view-only)

---

## Role Descriptions Section

Four info cards explaining each role:

### Superadmin Card

```
┌─────────────────────────────────────────┐
│ [Crown Icon]  Superadmin                │
├─────────────────────────────────────────┤
│ Unrestricted access to everything:      │
│                                         │
│ • All Admin capabilities                │
│ • Assign/remove Superadmin role         │
│ • No permission restrictions            │
│ • System-wide configuration             │
│ • Cannot be modified by Admin           │
└─────────────────────────────────────────┘
```

### Admin Card

```
┌─────────────────────────────────────────┐
│ [Shield Icon]  Admin                    │
├─────────────────────────────────────────┤
│ Full access to all features including:  │
│                                         │
│ • User management (full control)        │
│ • Approve/reject new users              │
│ • Change user roles & status            │
│ • System settings                       │
│ • All core features                     │
│                                         │
│ Limitations:                            │
│ • Cannot assign Superadmin role         │
│ • Cannot modify Superadmin users        │
└─────────────────────────────────────────┘
```

### Executive Assistant Card

```
┌─────────────────────────────────────────┐
│ [Briefcase Icon]  Executive Assistant   │
├─────────────────────────────────────────┤
│ Same access as Admin with one exception:│
│                                         │
│ • Tasks                                 │
│ • Customers                             │
│ • Pipeline                              │
│ • Training                              │
│ • FAQs                                  │
│ • Suppliers                             │
│ • User Management (VIEW ONLY)           │
│                                         │
│ Limitations:                            │
│ • Cannot approve/reject users           │
│ • Cannot change roles or status         │
│ • Cannot modify any user data           │
└─────────────────────────────────────────┘
```

### Client Card

```
┌─────────────────────────────────────────┐
│ [User Icon]  Client                     │
├─────────────────────────────────────────┤
│ Limited access for external clients:    │
│                                         │
│ • View assigned tasks                   │
│ • View relevant pipeline data           │
│ • Access shared resources               │
│                                         │
│ No access to:                           │
│ • User Management                       │
│ • System settings                       │
│ • Internal team features                │
└─────────────────────────────────────────┘
```

---

## Executive Assistant View-Only Mode

When an **Executive Assistant** accesses the User Management page, they see the same layout but with all interactive elements disabled.

### What Executive Assistants CAN See:
- Pending approvals list (without action buttons)
- Users table with all columns
- Role descriptions
- Rejected users section

### What Executive Assistants CANNOT Do:
- Approve or reject pending users
- Change user roles
- Change user status (activate/deactivate)
- Access any edit functionality

### Visual Differences

```
┌─────────────────────────────────────────────────────────────┐
│  PENDING USER CARD (Executive Assistant View)               │
├─────────────────────────────────────────────────────────────┤
│  [Avatar]  John Smith                                       │
│            john@example.com                                 │
│            Registered: Jan 15, 2025                         │
│                                                             │
│            [No Action Buttons - View Only]                  │
└─────────────────────────────────────────────────────────────┘
```

### Table Differences

| Column | Admin/Superadmin View | Executive Assistant View |
|--------|----------------------|--------------------------|
| Status | Dropdown (editable) | Text only (not clickable) |
| Actions | Role dropdown | Text showing current role |

### UI Indicator

Consider showing a banner or badge indicating view-only mode:

```
┌─────────────────────────────────────────────────────────────┐
│ [Eye Icon] You are viewing this page in read-only mode      │
└─────────────────────────────────────────────────────────────┘
```

---

## Rejected Users Section

### Header (Collapsible)

```
┌─────────────────────────────────────────┐
│ Rejected Users (3)            [▼ / ▲]  │
└─────────────────────────────────────────┘
```

- Collapsed by default
- Click to expand/collapse
- Shows count of rejected users
- Chevron icon indicates state

### Expanded Content

List of rejected users:

```
┌─────────────────────────────────────────────────┐
│ [Faded Avatar]  Bob Wilson                      │
│                 bob@example.com                 │
│                 [Rejected Badge]                │
├─────────────────────────────────────────────────┤
│ [Faded Avatar]  Alice Brown                     │
│                 alice@example.com               │
│                 [Rejected Badge]                │
└─────────────────────────────────────────────────┘
```

#### Elements:
| Element | Style |
|---------|-------|
| Avatar | 50% opacity (faded) |
| Name | Normal text |
| Email | Muted text |
| Badge | Red background, "Rejected" text |

**Note:** No action buttons - rejected users cannot be re-approved from this view.

---

## User Status Pages

### Pending Approval Page (`/pending`)

Shown to users awaiting admin approval.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [Clock Icon - Warning Color]             │
│                                                             │
│                    Account Pending Approval                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Avatar]                                            │   │
│  │ John Smith                                          │   │
│  │ john@example.com                                    │   │
│  │ [Pending Badge]                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Your account has been created successfully and is          │
│  awaiting admin approval.                                   │
│                                                             │
│  What happens next:                                         │
│  • An administrator will review your registration           │
│  • You'll be notified once your account is approved         │
│  • This page will automatically update when approved        │
│                                                             │
│  [Checking for approval every 5 seconds...]                 │
│                                                             │
│              [Sign Out Button]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Auto-refreshes status every 5 seconds
- Automatically redirects when approved
- Redirects to rejected page if rejected

---

### Rejected Page (`/rejected`)

Shown to users whose registration was denied.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [UserX Icon - Error Color]               │
│                                                             │
│                       Access Denied                         │
│                                                             │
│  Your registration request has been rejected by an          │
│  administrator.                                             │
│                                                             │
│  You do not have access to this platform. If you believe    │
│  this is an error, please contact the administrator.        │
│                                                             │
│              [Sign Out Button with Icon]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Deactivated Page (`/deactivated`)

Shown to users whose accounts have been deactivated.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [UserX Icon - Error Color]               │
│                                                             │
│                    Account Deactivated                      │
│                                                             │
│  Your account has been deactivated by an administrator.     │
│                                                             │
│  You no longer have access to the platform. If you          │
│  believe this is an error, please contact the               │
│  administrator for assistance.                              │
│                                                             │
│              [Sign Out Button with Icon]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## User Flow Diagrams

### New User Registration Flow

```
User Signs Up
     │
     ▼
┌─────────────┐
│ Clerk Auth  │
└─────────────┘
     │
     ▼
┌─────────────────┐
│ Sync to Database│
└─────────────────┘
     │
     ├── Is Admin Email? ──Yes──▶ Status: ACTIVE ──▶ Dashboard
     │
     No
     │
     ▼
Status: PENDING ──▶ Pending Page
     │
     │ (Admin Action)
     │
     ├── Approved ──▶ Status: ACTIVE ──▶ Dashboard
     │
     └── Rejected ──▶ Status: REJECTED ──▶ Rejected Page
```

### User Status State Machine

```
                    ┌──────────────────┐
                    │     PENDING      │
                    └──────────────────┘
                           │
              ┌────────────┼────────────┐
              │                         │
         [Approve]                 [Reject]
              │                         │
              ▼                         ▼
    ┌──────────────┐          ┌──────────────┐
    │    ACTIVE    │          │   REJECTED   │
    └──────────────┘          └──────────────┘
              │
         [Deactivate]
              │
              ▼
    ┌──────────────────┐
    │   DEACTIVATED    │
    └──────────────────┘
              │
         [Activate]
              │
              ▼
    ┌──────────────┐
    │    ACTIVE    │
    └──────────────┘
```

---

## Admin Actions Reference

### Approve User

| Property | Value |
|----------|-------|
| Trigger | Click "Approve" button on pending user card |
| API | `POST /api/users/approve` |
| Body | `{ targetUserId: string, action: "approve" }` |
| Result | User status → "active", records approver ID and timestamp |
| UI Update | Card removed from pending, user appears in main table |

### Reject User

| Property | Value |
|----------|-------|
| Trigger | Click "Reject" button on pending user card |
| API | `POST /api/users/approve` |
| Body | `{ targetUserId: string, action: "reject" }` |
| Result | User status → "rejected", records approver ID and timestamp |
| UI Update | Card removed from pending, user appears in rejected section |

### Change Role

| Property | Value |
|----------|-------|
| Trigger | Select new role from dropdown in Actions column |
| API | `PATCH /api/users/{id}` |
| Body | `{ role: "superadmin" \| "admin" \| "executive-assistant" \| "client" }` |
| Result | User role updated |
| UI Update | Role badge changes color and text |
| Permissions | Superadmin can assign any role; Admin cannot assign Superadmin |

### Change Status

| Property | Value |
|----------|-------|
| Trigger | Select new status from dropdown in Status column |
| API | `PATCH /api/users/{id}` |
| Body | `{ status: "active" \| "deactivated" }` |
| Result | User status updated |
| UI Update | Status indicator changes |

---

## Data Structure

### User Object

```typescript
interface User {
  id: string;              // Clerk user ID
  name: string | null;
  email: string | null;
  role: "superadmin" | "admin" | "executive-assistant" | "client";
  status: "pending" | "active" | "rejected" | "deactivated";
  imageUrl: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}
```

### Status Types

| Status | Description | Can Access App |
|--------|-------------|----------------|
| `pending` | Awaiting admin approval | No |
| `active` | Approved and active | Yes |
| `rejected` | Registration denied | No |
| `deactivated` | Account disabled | No |

### Role Types

| Role | Description | User Management Access | Can Be Modified By |
|------|-------------|------------------------|-------------------|
| `superadmin` | Unrestricted access, no limitations | Full | Superadmin only |
| `admin` | Full access with some restrictions | Full (except Superadmin) | Superadmin |
| `executive-assistant` | Same as Admin but view-only for users | View only | Superadmin, Admin |
| `client` | Limited external access | None | Superadmin, Admin |

### Role Hierarchy

```
Superadmin (highest)
    │
    ├── Can do everything
    ├── Can assign/remove any role
    └── Cannot be modified by Admin
         │
         ▼
      Admin
         │
         ├── Full access to most features
         ├── Can manage users (except Superadmin)
         └── Cannot assign Superadmin role
              │
              ▼
      Executive Assistant
              │
              ├── Same feature access as Admin
              ├── User Management: VIEW ONLY
              └── Cannot make any user changes
                   │
                   ▼
               Client (lowest)
                   │
                   ├── Limited feature access
                   └── No User Management access
```

---

## Icons Used

| Icon | Usage |
|------|-------|
| Crown | Superadmin role, platform owner indicator |
| Shield | Admin role, security, access denied |
| Briefcase | Executive Assistant role |
| User | Client role |
| Users | User lists |
| UserCog | User management navigation |
| UserX | Rejected/deactivated status |
| Clock | Pending status |
| Mail | Email addresses |
| CheckCircle | Success states, no pending items |
| ChevronUp/Down | Collapsible sections |
| LogOut | Sign out buttons |

---

## Summary

The User Management system provides:

- **Centralized admin dashboard** for all user operations
- **Approval workflow** for new registrations
- **Four-tier role system**: Superadmin → Admin → Executive Assistant → Client
- **Role-based access control**:
  - Superadmin: Unrestricted access, can manage everything
  - Admin: Full access but cannot modify Superadmin users
  - Executive Assistant: Full feature access + view-only User Management
  - Client: Limited access, no User Management
- **Status control** to activate/deactivate accounts
- **Clear status pages** for pending/rejected/deactivated users
- **Auto-refresh** for pending users to see approval in real-time
- **Protected actions** preventing self-modification and hierarchy violations
