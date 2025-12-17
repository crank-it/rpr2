# Fixing Clerk Authentication in Next.js: A Complete Guide

A practical guide to implementing and troubleshooting Clerk authentication with a custom user approval workflow.

---

## Table of Contents

1. [Overview](#overview)
2. [Initial Setup](#initial-setup)
3. [Common Authentication Issues & Fixes](#common-authentication-issues--fixes)
4. [Implementing User Approval Workflow](#implementing-user-approval-workflow)
5. [Protected Routes & User Detection](#protected-routes--user-detection)
6. [API Endpoints](#api-endpoints)
7. [Troubleshooting Guide](#troubleshooting-guide)

---

## Overview

This guide covers implementing Clerk authentication in a Next.js application with:
- Custom user approval workflow (admin must approve new users)
- Role-based access control (admin vs team members)
- Proper redirect handling to avoid infinite loops
- Database-driven user status management

### Architecture

```
Clerk (Identity) → Auth Callback → Database Status Check → Redirect Based on Status
```

- **Clerk**: Handles authentication (sign-in/sign-up)
- **Database (Supabase)**: Stores user status (`active`, `pending`, `rejected`, `deactivated`)
- **Auth Callback**: Bridge between Clerk auth and your app's approval system

---

## Initial Setup

### 1. Install Dependencies

```bash
npm install @clerk/nextjs
```

### 2. Environment Variables

```env
# Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs - Critical for proper redirects
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/auth/callback
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/sign-up/callback
```

### 3. Root Layout Configuration

```tsx
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

// IMPORTANT: Required for Clerk to work properly
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/auth/callback"
      signUpFallbackRedirectUrl="/sign-up/callback"
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### 4. Middleware Setup

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth/callback',
  '/pending',
  '/rejected',
  '/deactivated',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

---

## Common Authentication Issues & Fixes

### Issue 1: Infinite Redirect Loop on Sign-In

**Problem**: User gets stuck in a redirect loop after signing in.

**Cause**: The auth callback or protected route keeps re-checking status and redirecting.

**Solution**: Use a `hasChecked` flag to prevent multiple status checks.

```tsx
// app/auth/callback/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallback() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Prevent multiple checks
    if (!isLoaded || !user || hasChecked) return;

    const checkStatus = async () => {
      setHasChecked(true); // Mark as checked BEFORE the async call

      try {
        const response = await fetch("/api/users/check-status");
        const data = await response.json();

        switch (data.status) {
          case "active":
            router.replace("/");
            break;
          case "pending":
            router.replace("/pending");
            break;
          case "rejected":
            router.replace("/rejected");
            break;
          case "deactivated":
            router.replace("/deactivated");
            break;
          default:
            // User not found in database
            router.replace("/sign-up");
        }
      } catch (error) {
        console.error("Status check failed:", error);
        router.replace("/sign-in");
      }
    };

    checkStatus();
  }, [isLoaded, user, hasChecked, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent" />
      <span className="ml-3">Verifying your account...</span>
    </div>
  );
}
```

### Issue 2: Rejected Users Stuck in Sign-In Loop

**Problem**: Rejected users sign in, get redirected to `/rejected`, click sign out, but get redirected back to `/rejected`.

**Cause**: The UserSyncProvider was checking status even on public routes.

**Solution**: Immediately render public paths without status checks.

```tsx
// components/UserSyncProvider.tsx
"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/auth/callback",
  "/pending",
  "/rejected",
  "/deactivated",
];

export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  // CRITICAL: Check if current path is public FIRST
  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Immediately render public paths without any checks
  if (isPublicPath) {
    return <>{children}</>;
  }

  useEffect(() => {
    if (!isLoaded) return;

    // No user = redirect to sign-in
    if (!user) {
      router.replace("/sign-in");
      return;
    }

    const verifyStatus = async () => {
      try {
        const response = await fetch("/api/users/check-status");
        const data = await response.json();

        if (data.status === "active") {
          setIsChecking(false);
        } else if (data.status === "pending") {
          router.replace("/pending");
        } else if (data.status === "rejected") {
          router.replace("/rejected");
        } else if (data.status === "deactivated") {
          router.replace("/deactivated");
        } else {
          // User not in database - sign them out
          await signOut();
          router.replace("/sign-up");
        }
      } catch (error) {
        console.error("Status verification failed:", error);
        setIsChecking(false);
      }
    };

    verifyStatus();
  }, [isLoaded, user, router, signOut]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
```

### Issue 3: Already Signed-In User Sees Sign-In Page

**Problem**: A user who's already authenticated visits `/sign-in` and sees the form instead of being redirected.

**Solution**: Detect signed-in user and redirect to callback.

```tsx
// app/sign-in/[[...sign-in]]/page.tsx
"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // If user is already signed in, redirect to callback
    if (isLoaded && user) {
      setIsRedirecting(true);
      router.replace("/auth/callback");
    }
  }, [isLoaded, user, router]);

  // Show loading while Clerk loads or while redirecting
  if (!isLoaded || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn />
    </div>
  );
}
```

### Issue 4: useEffect Dependency Array Causing Infinite Loops

**Problem**: Adding `status` state to dependency array causes infinite re-fetching.

**Cause**: When status updates, effect runs again, fetches status, updates status, repeat.

**Solution**: Use a separate `hasChecked` boolean that only changes once.

```tsx
// BAD - causes infinite loop
const [status, setStatus] = useState<string | null>(null);

useEffect(() => {
  fetchStatus().then(setStatus);
}, [status]); // status changes → effect runs → status changes → ...

// GOOD - only runs once
const [hasChecked, setHasChecked] = useState(false);

useEffect(() => {
  if (hasChecked) return;
  setHasChecked(true);
  fetchStatus().then(handleRedirect);
}, [hasChecked]);
```

---

## Implementing User Approval Workflow

### Database Schema

```sql
-- Supabase/PostgreSQL
CREATE TABLE users (
  id TEXT PRIMARY KEY,           -- Clerk user ID
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'team',      -- 'admin' or 'team'
  status TEXT DEFAULT 'pending', -- 'active', 'pending', 'rejected', 'deactivated'
  image_url TEXT,
  approved_by TEXT,              -- ID of approving admin
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### User Sync After Sign-Up

```ts
// app/api/auth/sync-user/route.ts
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = ["admin@example.com", "owner@example.com"];

export async function POST() {
  const user = await currentUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const isAdmin = ADMIN_EMAILS.includes(user.emailAddresses[0]?.emailAddress || "");
  const role = isAdmin ? "admin" : "team";
  const status = isAdmin ? "active" : "pending"; // Admins auto-approved

  // Insert or update user in database
  const { error } = await supabase.from("users").upsert({
    id: user.id,
    name: user.fullName,
    email: user.emailAddresses[0]?.emailAddress,
    image_url: user.imageUrl,
    role,
    status,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return Response.json({ error: "Failed to sync user" }, { status: 500 });
  }

  // Update Clerk metadata with role
  const client = await clerkClient();
  await client.users.updateUserMetadata(user.id, {
    publicMetadata: { role },
  });

  return Response.json({ success: true, status });
}
```

### Check User Status

```ts
// app/api/users/check-status/route.ts
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Try to find user by ID first
  let { data: dbUser } = await supabase
    .from("users")
    .select("status, role")
    .eq("id", user.id)
    .single();

  // Fallback: find by email (for legacy users)
  if (!dbUser) {
    const email = user.emailAddresses[0]?.emailAddress;
    const { data: emailUser } = await supabase
      .from("users")
      .select("id, status, role")
      .eq("email", email)
      .single();

    if (emailUser) {
      // Update the user ID to match Clerk
      await supabase
        .from("users")
        .update({ id: user.id, updated_at: new Date().toISOString() })
        .eq("email", email);

      dbUser = emailUser;
    }
  }

  if (!dbUser) {
    return Response.json({ status: "not_found" });
  }

  return Response.json({
    status: dbUser.status,
    role: dbUser.role,
  });
}
```

### Approve/Reject Users (Admin Only)

```ts
// app/api/users/approve/route.ts
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = ["admin@example.com", "owner@example.com"];

export async function POST(request: Request) {
  const admin = await currentUser();

  if (!admin) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Verify admin role
  const adminEmail = admin.emailAddresses[0]?.emailAddress;
  const isAdmin =
    admin.publicMetadata?.role === "admin" ||
    ADMIN_EMAILS.includes(adminEmail || "");

  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, action } = await request.json();

  if (!userId || !["approve", "reject"].includes(action)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const newStatus = action === "approve" ? "active" : "rejected";

  const { error } = await supabase
    .from("users")
    .update({
      status: newStatus,
      approved_by: admin.id,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }

  return Response.json({ success: true, status: newStatus });
}
```

---

## Protected Routes & User Detection

### Pending Page with Auto-Refresh

```tsx
// app/pending/page.tsx
"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PendingPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  // Check status every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/users/check-status");
        const data = await response.json();

        if (data.status === "active") {
          router.replace("/");
        } else if (data.status === "rejected") {
          router.replace("/rejected");
        }
      } catch (error) {
        console.error("Status check failed:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Account Pending Approval</h1>
      <p className="text-gray-600 mb-2">
        Your account is awaiting admin approval.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Signed in as: {user?.emailAddresses[0]?.emailAddress}
      </p>
      <button
        onClick={() => signOut({ redirectUrl: "/sign-in" })}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Sign Out
      </button>
    </div>
  );
}
```

### Rejected Page

```tsx
// app/rejected/page.tsx
"use client";

import { useClerk } from "@clerk/nextjs";

export default function RejectedPage() {
  const { signOut } = useClerk();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-6">
        Your registration request has been denied.
      </p>
      <button
        onClick={() => signOut({ redirectUrl: "/sign-in" })}
        className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
      >
        Sign Out
      </button>
    </div>
  );
}
```

---

## Troubleshooting Guide

### Quick Checklist

| Issue | Solution |
|-------|----------|
| Infinite redirect loop | Add `hasChecked` flag to prevent multiple status checks |
| Sign-in page shows for logged-in user | Add user detection with `useUser()` hook |
| Rejected user can't sign out | Make sure public paths render immediately without status checks |
| User not found after sign-up | Ensure `/api/auth/sync-user` is called after sign-up callback |
| Status check fails | Verify Supabase service role key has proper permissions |
| Clerk not loading | Add `export const dynamic = 'force-dynamic'` to layout |

### Debug Tips

1. **Add console logs** at key points:
   ```tsx
   console.log("Auth state:", { isLoaded, user: user?.id, hasChecked });
   ```

2. **Check network tab** for API responses to `/api/users/check-status`

3. **Verify environment variables** are set correctly in both development and production

4. **Test status flow manually**:
   - Set user status to `pending` in database
   - Sign in and verify redirect to `/pending`
   - Update status to `active`
   - Verify redirect to dashboard

### Common Mistakes to Avoid

1. **Don't use `status` in useEffect dependency array** - causes infinite loops
2. **Don't forget `force-dynamic`** - Clerk needs this for server-side auth
3. **Don't block public routes** - users need access to sign-out even when rejected
4. **Don't skip the callback page** - it's the bridge between Clerk and your app

---

## Summary

The key to fixing Clerk authentication issues:

1. **Use callback pages** as the bridge between Clerk auth and your app logic
2. **Track check state** with a boolean flag, not the status itself
3. **Render public paths immediately** without any status checks
4. **Detect existing sessions** on auth pages to prevent confusion
5. **Separate concerns**: Clerk handles identity, your database handles status

This architecture ensures smooth authentication flow without infinite loops or stuck states.
