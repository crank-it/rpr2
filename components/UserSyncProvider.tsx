"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

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
  const hasChecked = useRef(false);

  // Check if current path is public FIRST
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

    // Skip if already checked this session
    if (hasChecked.current) {
      setIsChecking(false);
      return;
    }

    // Check sessionStorage for cached status
    const cachedStatus = sessionStorage.getItem(`user_status_${user.id}`);
    if (cachedStatus === "active") {
      hasChecked.current = true;
      setIsChecking(false);
      return;
    }

    const verifyStatus = async () => {
      try {
        const response = await fetch("/api/users/check-status");
        const data = await response.json();

        hasChecked.current = true;

        if (data.status === "active") {
          // Cache the active status
          sessionStorage.setItem(`user_status_${user.id}`, "active");
          setIsChecking(false);
        } else if (data.status === "pending") {
          router.replace("/pending");
        } else if (data.status === "rejected") {
          router.replace("/rejected");
        } else if (data.status === "deactivated") {
          router.replace("/deactivated");
        } else {
          // User not in database - redirect to sign-up callback to sync
          router.replace("/sign-up/callback");
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
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 rounded-full border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
