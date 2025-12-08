# Real-Time & Notifications - Implementation Guide

This document describes how real-time updates and notifications work in this project, so you can implement a similar system on other projects.

---

## Overview

The project uses **Supabase Realtime** for live database updates. When data changes in the database, all connected clients automatically receive updates without refreshing the page.

**Key Features:**
- Live user management updates (approve/reject/role changes)
- Real-time pending user count badge in sidebar
- Automatic UI refresh when database changes

---

## How Supabase Realtime Works

Supabase Realtime uses PostgreSQL's built-in change data capture (CDC) to broadcast database changes to connected clients via WebSockets.

**Flow:**
```
User Action (e.g., approve user)
        ↓
API updates database
        ↓
Supabase detects change (INSERT/UPDATE/DELETE)
        ↓
Broadcasts to all subscribed clients
        ↓
Client callback executes (refetch data)
        ↓
UI re-renders with new data
```

---

## Implementation Pattern

### Basic Structure

Each component that needs real-time updates follows this pattern:

1. **Create Supabase client** (browser-side)
2. **Define fetch function** to get data
3. **Subscribe to channel** on component mount
4. **Cleanup subscription** on component unmount

### Required Imports

From your Supabase client file:
- `createSPAClient` - Creates browser-side Supabase client

From React:
- `useEffect` - For subscription lifecycle
- `useCallback` - For memoizing fetch functions
- `useState` - For storing data

---

## Real-Time Implementations

### 1. User Management Page

**Location:** `src/app/app/user-management/page.tsx`

**What it does:**
- Subscribes to `users` table changes
- Automatically refetches all users when any change occurs
- Updates pending, active, and rejected user lists in real-time

**Channel name:** `users-changes`

**Events listened:** `*` (INSERT, UPDATE, DELETE)

**Key behavior:**
- When admin approves a user → all admins see the change instantly
- When user status changes → lists update automatically
- When role changes → role badges update in real-time

---

### 2. Sidebar Pending Badge

**Location:** `src/components/AppLayout.tsx`

**What it does:**
- Shows pending user count in navigation
- Updates count in real-time when users register or get approved
- Displays animated pulsing badge when pending users exist

**Channel name:** `sidebar-users-changes`

**Events listened:** `*` (INSERT, UPDATE, DELETE)

**Visual features:**
- Red badge with count number
- Pulsing animation for visibility
- Hidden when count is zero

---

## Subscription Setup Steps

### Step 1: Create the Supabase Client

Use the SPA (Single Page Application) client for browser-side subscriptions.

**File:** `src/lib/supabase/client.ts`

The client must be created for browser use, not server-side.

---

### Step 2: Create Fetch Function

Create a memoized function to fetch your data:

- Use `useCallback` to prevent unnecessary re-renders
- Function will be called on initial load and on every real-time update

---

### Step 3: Set Up Subscription in useEffect

Inside a `useEffect` hook:

1. Call initial data fetch
2. Create Supabase client instance
3. Create a channel with unique name
4. Subscribe to `postgres_changes` event
5. Specify: event type, schema, table name
6. Define callback to refetch data
7. Call `.subscribe()` to activate

---

### Step 4: Cleanup on Unmount

Return a cleanup function from `useEffect`:

- Call `supabase.removeChannel(channel)` to unsubscribe
- Prevents memory leaks and duplicate subscriptions

---

## Channel Configuration Options

### Event Types

| Event | Description |
|-------|-------------|
| `*` | Listen to all changes (INSERT, UPDATE, DELETE) |
| `INSERT` | Only new records |
| `UPDATE` | Only modified records |
| `DELETE` | Only deleted records |

### Filter Options

You can filter which changes trigger updates:

- **schema**: Usually `'public'`
- **table**: Table name to watch
- **filter**: Optional column filter (e.g., `'organization_id=eq.123'`)

---

## Notification System

### Current Implementation

The project uses **state-based notifications** rather than toast libraries:

1. **Error states** - Display error messages inline
2. **Success states** - Show confirmation messages
3. **Loading states** - Show spinners during operations

### Alert Components Used

**Location:** `src/components/ui/`

- `alert.tsx` - For informational/error messages
- `alert-dialog.tsx` - For confirmation dialogs before destructive actions

### Notification Patterns

**Error handling:**
- Store error in state: `const [error, setError] = useState('')`
- Display conditionally in UI when error exists
- Clear error when user retries

**Success feedback:**
- Show success message briefly
- Update UI to reflect changes
- Clear message after timeout (optional)

**Loading states:**
- Disable buttons during operations
- Show spinner icon
- Prevent duplicate submissions

---

## Supabase Dashboard Setup

### Enable Realtime for Tables

1. Go to Supabase Dashboard
2. Navigate to **Database** → **Replication**
3. Find your table (e.g., `users`)
4. Toggle **Realtime** ON for that table

**Important:** Realtime must be enabled per-table in Supabase dashboard, or changes won't broadcast.

---

## Database Tables with Realtime

Currently enabled for:

| Table | Used For |
|-------|----------|
| `users` | User management, pending count badge |

To add more tables:
1. Enable realtime in Supabase dashboard
2. Create subscription in relevant component
3. Use unique channel name

---

## Best Practices

### Channel Naming

Use descriptive, unique channel names:
- `users-changes` - User management page
- `sidebar-users-changes` - Sidebar badge
- `tasks-updates` - Tasks page (if added)

Different channel names allow independent subscriptions to same table.

### Performance Considerations

1. **Only subscribe where needed** - Don't add realtime to every component
2. **Use specific event types** - If you only need INSERTs, don't listen to `*`
3. **Add filters when possible** - Filter by organization_id to reduce traffic
4. **Clean up subscriptions** - Always remove channels on unmount

### Error Handling

- Wrap subscription setup in try-catch
- Handle connection failures gracefully
- Consider fallback to manual refresh button

---

## Files Summary

| File | Purpose |
|------|---------|
| `src/lib/supabase/client.ts` | Supabase browser client |
| `src/app/app/user-management/page.tsx` | Real-time user list |
| `src/components/AppLayout.tsx` | Real-time pending badge |
| `src/components/ui/alert.tsx` | Alert notifications |
| `src/components/ui/alert-dialog.tsx` | Confirmation dialogs |

---

## Adding Real-Time to New Features

### Checklist

- [ ] Enable realtime for table in Supabase dashboard
- [ ] Import Supabase SPA client
- [ ] Create fetch function with useCallback
- [ ] Set up subscription in useEffect
- [ ] Use unique channel name
- [ ] Add cleanup function to remove channel
- [ ] Test by making changes in another browser/tab

### Common Issues

1. **Changes not appearing** → Check if realtime is enabled in Supabase dashboard
2. **Duplicate updates** → Ensure cleanup function removes channel
3. **Subscription not working** → Verify using browser client, not server client
4. **Memory leaks** → Always return cleanup function from useEffect

---

## Technologies Used

- **@supabase/supabase-js** - Supabase client with realtime support
- **@supabase/ssr** - Server-side rendering support
- **React hooks** - useEffect, useCallback, useState
- **@radix-ui/react-alert-dialog** - UI alert dialogs
- **lucide-react** - Icons for notifications

---

## Testing Real-Time

1. Open app in two browser tabs/windows
2. Make a change in one tab (e.g., approve a user)
3. Verify change appears in other tab without refresh
4. Check browser console for any subscription errors
5. Test cleanup by navigating away and back
