"use client";

// Temporarily disabled - no authentication
// Just passes through children without any user checks
export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
