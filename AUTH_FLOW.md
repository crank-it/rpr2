# Authentication Flow Documentation

A comprehensive guide to how authentication works in this application, including sign-up, sign-in, and all edge cases.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [User Roles & Statuses](#user-roles--statuses)
4. [Sign-Up Flow](#sign-up-flow)
5. [Sign-In Flow](#sign-in-flow)
6. [Edge Cases & Scenarios](#edge-cases--scenarios)
7. [Key Files Reference](#key-files-reference)
8. [Environment Variables](#environment-variables)

---

## Overview

This application uses **Clerk** for authentication (handling Google OAuth, session management) combined with **Supabase** for storing user data and approval status.

### Key Concepts

- **Clerk** = Identity provider (who you are)
- **Supabase** = User database (your role, status, approval)
- **Two-step verification**: You must exist in BOTH Clerk AND Supabase to access the app

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Authentication Flow                          │
└─────────────────────────────────────────────────────────────────────┘

  User clicks "Continue with Google"
                │
                ▼
        ┌───────────────┐
        │    Clerk      │  ← Handles OAuth, creates session
        │   (Google)    │
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │   Callback    │  ← Checks if user exists in database
        │    Page       │
        └───────┬───────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
   User EXISTS     User NOT FOUND
   in database     in database
        │               │
        ▼               ▼
   Redirect by     Show options:
   status:         - Create Account
   - active → /    - Use Different Account
   - pending → /pending
   - rejected → /rejected
   - deactivated → /deactivated
```

---

## User Roles & Statuses

### Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `superadmin` | System owner | Full access, can manage admins, set manually only |
| `admin` | Administrator | Can approve/reject users, manage regular users |
| `user` | Regular user | Basic access, cannot manage users |

### Statuses

| Status | Description | Can Access App? |
|--------|-------------|-----------------|
| `active` | Approved by admin | Yes |
| `pending` | Awaiting approval | No (sees pending page) |
| `rejected` | Denied by admin | No (sees rejected page) |
| `deactivated` | Disabled by admin | No (sees deactivated page) |

---

## Sign-Up Flow

### Normal Sign-Up (New User)

```
Step 1: User visits /sign-up
              │
              ▼
Step 2: User selects a role (Admin or User)
              │
              ▼
Step 3: Role saved to localStorage
        Key: "signupRequestedRole"
              │
              ▼
Step 4: Clerk SignUp component shown
        User clicks "Continue with Google"
              │
              ▼
Step 5: Google OAuth completes
        Clerk redirects to /sign-up/callback
              │
              ▼
Step 6: Callback checks:
        - User exists in DB? No
        - Role in localStorage? Yes
              │
              ▼
Step 7: Calls /api/auth/sync-user
        Creates user in Supabase with:
        - role: selected role
        - status: "pending"
              │
              ▼
Step 8: Redirects to /pending
        User waits for admin approval
              │
              ▼
Step 9: Admin approves in /user-management
              │
              ▼
Step 10: Pending page auto-detects approval
         Redirects to home (/)
```

### Sign-Up with Admin Email

If the user's email is in the `ADMIN_EMAILS` list (configured in `/api/auth/sync-user`):

```
Same steps 1-6, then:
              │
              ▼
Step 7: Calls /api/auth/sync-user
        Detects admin email, creates user with:
        - role: "superadmin"
        - status: "active"  ← Auto-approved!
              │
              ▼
Step 8: Redirects directly to home (/)
        No approval needed
```

---

## Sign-In Flow

### Normal Sign-In (Existing User with Account)

```
Step 1: User visits /sign-in
              │
              ▼
Step 2: Clerk SignIn component shown
        User clicks "Continue with Google"
              │
              ▼
Step 3: Google OAuth completes
        Clerk redirects to /auth/callback
              │
              ▼
Step 4: Callback calls /api/users/check-status
        Returns: { status: "active", role: "admin" }
              │
              ▼
Step 5: Redirects based on status:
        - active → / (home)
        - pending → /pending
        - rejected → /rejected
        - deactivated → /deactivated
```

### Sign-In Without Account (User Not in Database)

```
Step 1: User visits /sign-in
              │
              ▼
Step 2: Clerk SignIn component shown
        User clicks "Continue with Google"
              │
              ▼
Step 3: Google OAuth completes
        Clerk redirects to /auth/callback
              │
              ▼
Step 4: Callback calls /api/users/check-status
        Returns: { status: "not_found" }
              │
              ▼
Step 5: Checks localStorage for role
        No role found (user didn't go through sign-up)
              │
              ▼
Step 6: Shows "No Account Found" screen with:
        - Current email displayed
        - [Create Account] → goes to /sign-up
        - [Use Different Account] → signs out, goes to /sign-in
              │
              ▼
Step 7a: If "Create Account" clicked:
         Goes to /sign-up with user already authenticated
         Shows role selection with "Switch" option
         User selects role → account created → /pending
              │
Step 7b: If "Use Different Account" clicked:
         Signs out of Clerk
         Redirects to /sign-in
         User can try different Google account
```

---

## Edge Cases & Scenarios

### Scenario 1: User Manually Navigates to /pending

**What happens:**
1. Pending page loads
2. Initial status check runs
3. If user NOT in database → redirects to /sign-up
4. If user is active → redirects to /
5. If user is pending → shows pending UI

**Protection:** Prevents fake "pending" state without actual database record.

---

### Scenario 2: Already Signed-In User Visits /sign-in

**What happens:**
1. Sign-in page detects existing Clerk session
2. Automatically redirects to /auth/callback
3. Callback checks database status
4. Redirects based on status

**Protection:** Prevents confusion, skips unnecessary sign-in.

---

### Scenario 3: User Wants to Switch Google Accounts

**Available at:**
- `/auth/callback` (No Account Found screen) → "Use Different Account" button
- `/sign-up` (Role Selection screen) → "Switch" link next to profile

**What happens:**
1. Clears localStorage role selection
2. Signs out of Clerk
3. Redirects to /sign-in
4. User can choose different Google account

---

### Scenario 4: Pending User Refreshes Page

**What happens:**
1. Pending page polls /api/users/check-status every 5 seconds
2. When status changes to "active" → auto-redirects to /
3. When status changes to "rejected" → auto-redirects to /rejected
4. No manual refresh needed

---

### Scenario 5: User Approved While on Pending Page

**What happens:**
1. Admin clicks "Approve" in /user-management
2. Database updates user status to "active"
3. Pending page's 5-second poll detects change
4. Automatically redirects to home (/)

---

### Scenario 6: Rejected User Tries to Sign In Again

**What happens:**
1. User signs in with Clerk
2. Callback checks status → "rejected"
3. Redirects to /rejected page
4. User can sign out and try different account

---

### Scenario 7: Protected Route Access Without Auth

**What happens:**
1. Middleware (Clerk) detects no session
2. Redirects to /sign-in
3. After sign-in, redirects back to original route (via callback)

---

## Key Files Reference

### Authentication Pages

| File | Purpose |
|------|---------|
| `app/sign-in/[[...sign-in]]/page.tsx` | Sign-in page with Clerk component |
| `app/sign-up/[[...sign-up]]/page.tsx` | Sign-up with role selection |
| `app/sign-up/callback/page.tsx` | Post-signup processing |
| `app/auth/callback/page.tsx` | Post-signin processing |
| `app/pending/page.tsx` | Waiting for approval screen |
| `app/rejected/page.tsx` | Access denied screen |
| `app/deactivated/page.tsx` | Account disabled screen |

### API Routes

| File | Purpose |
|------|---------|
| `app/api/auth/sync-user/route.ts` | Creates user in database |
| `app/api/users/check-status/route.ts` | Returns user status/role |
| `app/api/users/approve/route.ts` | Approve/reject users |
| `app/api/users/[id]/route.ts` | Update user role/status |
| `app/api/users/route.ts` | List all users (admin only) |

### Components & Providers

| File | Purpose |
|------|---------|
| `middleware.ts` | Clerk route protection |
| `app/layout.tsx` | ClerkProvider wrapper |
| `components/UserSyncProvider.tsx` | Status checks on protected routes |
| `components/AppLayout.tsx` | Main layout with UserMenu |

---

## Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/auth/callback
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/sign-up/callback

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Visual Flow Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SIGN-UP FLOW                                  │
└─────────────────────────────────────────────────────────────────────┘

/sign-up → Select Role → Continue with Google → /sign-up/callback
                                                       │
                                    ┌──────────────────┴──────────────────┐
                                    │                                      │
                              Admin Email?                           Regular User
                                    │                                      │
                                    ▼                                      ▼
                            Auto-approved                          Status: pending
                            Status: active                                 │
                                    │                                      ▼
                                    ▼                               /pending (wait)
                                 / (home)                                  │
                                                                          ▼
                                                                   Admin approves
                                                                          │
                                                                          ▼
                                                                      / (home)


┌─────────────────────────────────────────────────────────────────────┐
│                        SIGN-IN FLOW                                  │
└─────────────────────────────────────────────────────────────────────┘

/sign-in → Continue with Google → /auth/callback
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                        │
              User EXISTS                              User NOT FOUND
              in database                              in database
                    │                                        │
                    ▼                                        ▼
            Check status:                          "No Account Found"
            - active → /                                    │
            - pending → /pending               ┌────────────┴────────────┐
            - rejected → /rejected             │                          │
            - deactivated → /deactivated  [Create Account]     [Use Different Account]
                                               │                          │
                                               ▼                          ▼
                                        /sign-up (role)            Sign out →
                                               │                    /sign-in
                                               ▼
                                        /sign-up/callback
                                               │
                                               ▼
                                           /pending
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Stuck on pending page | User not in database | Page now auto-redirects to /sign-up |
| Can't switch accounts | No sign-out option | Added "Use Different Account" button |
| Infinite redirect loop | Status check in useEffect deps | Use `hasChecked` flag pattern |
| Protected route accessible | Middleware disabled | Enabled Clerk middleware |
| User not synced to DB | Missing sync-user call | Callback now calls sync-user API |

---

## Admin Workflow

### Approving Users

1. Admin logs in (must have `admin` or `superadmin` role)
2. Navigate to `/user-management`
3. See pending users with their requested role
4. Click **Approve** or **Reject**
5. User is notified automatically (pending page updates)

### Managing Users

- Change user role: Select from dropdown (Admin/User)
- Deactivate user: Change status to "Deactivated"
- Superadmin can only be set manually in database

---

*Last updated: December 2024*
