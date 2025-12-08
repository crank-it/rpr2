# Sign-Up with Role Selection - Implementation Guide

This document describes how the role selection during sign-up feature works, so you can implement a similar system on other projects.

---

## Overview

Users must select a role before creating an account. The sign-up process is blocked until a role is selected. The selected role is stored with their account and visible to administrators for approval.

---

## Flow Summary

1. User visits `/sign-up`
2. User sees role selection screen (cannot proceed without selecting)
3. User selects a role and clicks "Continue"
4. User completes account creation via Clerk
5. Selected role is saved to the database with user record
6. User is redirected to pending page (awaiting admin approval)
7. Admin sees pending user with their requested role displayed
8. Admin approves/rejects the user

---

## Components Modified

### 1. Sign-Up Page (`/sign-up`)

**Location:** `src/app/sign-up/[[...sign-up]]/page.tsx`

**What it does:**
- Displays a role selection UI before showing the Clerk SignUp form
- Stores the selected role in browser localStorage
- Only shows the Clerk SignUp form after a role is selected
- Provides a "Back" button to change role selection

**Key elements:**
- Role options array with: value, label, description, icon
- State to track selected role and whether to show sign-up form
- Continue button disabled until role is selected
- LocalStorage key: `signupRequestedRole`

---

### 2. Sign-Up Callback Page (`/sign-up/callback`)

**Location:** `src/app/sign-up/callback/page.tsx`

**What it does:**
- Runs after Clerk authentication completes
- Reads the selected role from localStorage
- If no role found, redirects back to `/sign-up` (blocks account creation)
- Sends the role to the sync-user API
- Clears localStorage after successful sync
- Redirects user based on their status (pending/active/rejected)

**Key behavior:**
- Acts as a gatekeeper - no role = no account sync
- Passes role in request body to the API

---

### 3. Sync User API (`/api/auth/sync-user`)

**Location:** `src/app/api/auth/sync-user/route.ts`

**What it does:**
- Receives POST request with `requestedRole` in body
- Validates role against allowed values
- Creates user in database with the selected role
- Admin emails get auto-approved with superadmin role (overrides selection)
- All other users get status: "pending"

**Key configuration:**
- `VALID_ROLES` array: defines which roles users can request
- `ADMIN_EMAILS` array: emails that get auto-approved as superadmin

---

### 4. User Management Page (`/app/user-management`)

**Location:** `src/app/app/user-management/page.tsx`

**What it does:**
- Displays pending users with their requested role
- Shows a role badge next to each pending user
- Admins can approve/reject users
- After approval, admins can change the user's role if needed

**Display format:**
- Shows "Wants: [Role Badge]" for each pending user
- Uses colored badges with icons for each role type

---

## Displaying Requested Role in Admin

### Where It Appears

In the **Pending Approvals** section of the User Management page, each pending user card shows:
- User avatar/initials
- User name
- User email
- **"Wants: [Role Badge]"** - displays the role they selected during sign-up
- Registration date
- Approve/Reject buttons

### RoleBadge Component

A reusable component that displays roles with consistent styling:

**Role styling configuration:**
| Role | Background | Text Color | Icon |
|------|------------|------------|------|
| superadmin | violet-100 | violet-700 | Crown |
| admin | red-100 | red-700 | Shield |
| executive-assistant | blue-100 | blue-700 | Briefcase |
| client | gray-100 | gray-700 | User |

**Badge format:**
- Rounded pill shape
- Icon + Role label
- Small text size (text-xs)

### How to Add New Role Styling

When adding new roles, update the `RoleBadge` component's config object:
- Add the role value as a key
- Define `bg` (background class)
- Define `text` (text color class)
- Define `icon` (Lucide icon component)

### Display Location in Pending Card

The role badge appears below the user's email, with the label "Wants:" preceding it:

```
┌─────────────────────────────────────┐
│ [Avatar]  John Doe                  │
│           john@example.com          │
│           Wants: [Admin Badge]      │
│           Registered: Nov 26, 2024  │
│                                     │
│   [Approve]        [Reject]         │
└─────────────────────────────────────┘
```

---

## Database Requirements

The `users` table needs these columns:
- `id` (TEXT, primary key) - Clerk user ID
- `email` (TEXT)
- `name` (TEXT)
- `image_url` (TEXT)
- `role` (TEXT) - stores the requested/assigned role
- `status` (TEXT) - pending, active, rejected, deactivated
- `organization_id` (UUID, foreign key)
- `approved_by` (TEXT)
- `approved_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

---

## How to Customize for Different Roles

### Step 1: Define Your Roles

Decide what roles your application needs. Example structures:

**Option A - Business App:**
- Admin
- Manager
- Employee
- Client

**Option B - Educational:**
- Administrator
- Teacher
- Student
- Parent

**Option C - Healthcare:**
- Admin
- Doctor
- Nurse
- Patient

### Step 2: Update Role Options in Sign-Up Page

Modify the `roleOptions` array with your roles:
- `value`: internal identifier (lowercase, hyphenated)
- `label`: display name
- `description`: short explanation of what this role can do
- `icon`: Lucide icon component

### Step 3: Update Valid Roles in API

Update the `VALID_ROLES` array in the sync-user API to match your role values.

### Step 4: Update User Management Display

Ensure the role badge component in user management has styling for all your roles:
- Background color
- Text color
- Icon

### Step 5: Update Database Types (if using TypeScript)

Add your `users` table type to your database types file (`src/lib/types.ts`).

---

## Security Considerations

1. **Role validation**: The API validates roles server-side against `VALID_ROLES`
2. **No role = no account**: If localStorage is cleared/missing, user is redirected back
3. **Admin override**: Certain emails can be auto-approved (configure in `ADMIN_EMAILS`)
4. **Pending by default**: All users start as "pending" and require admin approval
5. **Role is a request**: The role chosen is what the user *wants*, admin can change it

---

## User Experience Notes

- Role selection is mandatory - cannot be skipped
- Clear descriptions help users choose the right role
- Visual feedback (blue highlight, checkmark) shows selected role
- "Back" button allows changing selection before completing sign-up
- Informational text explains that admin approval is required

---

## Files Changed Summary

| File | Purpose |
|------|---------|
| `src/app/sign-up/[[...sign-up]]/page.tsx` | Role selection UI |
| `src/app/sign-up/callback/page.tsx` | Pass role to API |
| `src/app/api/auth/sync-user/route.ts` | Save role to database |
| `src/app/app/user-management/page.tsx` | Display requested role |
| `src/lib/types.ts` | Database type definitions |

---

## Testing Checklist

- [ ] User cannot proceed without selecting a role
- [ ] Selected role appears in localStorage before Clerk sign-up
- [ ] Role is saved correctly in database after sign-up
- [ ] Admin can see requested role in pending users list
- [ ] Admin can approve user and optionally change their role
- [ ] Refreshing page during sign-up maintains role selection
- [ ] Invalid roles are rejected by the API
