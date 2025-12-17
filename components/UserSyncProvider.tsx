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
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check if current path is public
  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  useEffect(() => {
    // Skip checks for public paths
    if (isPublicPath) {
      setIsChecking(false);
      setIsAuthorized(true);
      return;
    }

    if (!isLoaded) return;

    // No user on protected route = redirect to sign-in
    if (!user) {
      router.replace("/sign-in");
      return;
    }

    const verifyStatus = async () => {
      try {
        const response = await fetch("/api/users/check-status");
        const data = await response.json();

        if (data.status === "active") {
          setIsAuthorized(true);
          setIsChecking(false);
        } else if (data.status === "pending") {
          router.replace("/pending");
        } else if (data.status === "rejected") {
          router.replace("/rejected");
        } else if (data.status === "deactivated") {
          router.replace("/deactivated");
        } else if (data.status === "not_found") {
          // User not in database - redirect to sign-up to select a role
          router.replace("/sign-up");
        } else {
          // Unknown status - redirect to sign-in
          await signOut();
          router.replace("/sign-in");
        }
      } catch (error) {
        console.error("Status verification failed:", error);
        setIsChecking(false);
        setIsAuthorized(true); // Allow access on error to prevent blocking
      }
    };

    verifyStatus();
  }, [isLoaded, user, isPublicPath, router, signOut, pathname]);

  // For public paths, render immediately
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Show loading while checking
  if (isChecking || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 rounded-full border-t-transparent" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Only render children if authorized
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 rounded-full border-t-transparent" />
          <span className="text-gray-600">Redirecting...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
