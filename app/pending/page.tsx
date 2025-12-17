"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Clock, LogOut } from "lucide-react";

export default function PendingPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isValidPending, setIsValidPending] = useState(false);

  // Initial check when page loads - verify user actually exists in database
  useEffect(() => {
    if (!isLoaded) return;

    // If no user is signed in, redirect to sign-in
    if (!user) {
      router.replace("/sign-in");
      return;
    }

    const checkInitialStatus = async () => {
      try {
        const response = await fetch("/api/users/check-status");
        const data = await response.json();

        if (data.status === "not_found") {
          // User doesn't exist in database - redirect to sign-up to create account
          router.replace("/sign-up");
        } else if (data.status === "active") {
          router.replace("/");
        } else if (data.status === "rejected") {
          router.replace("/rejected");
        } else if (data.status === "deactivated") {
          router.replace("/deactivated");
        } else if (data.status === "pending") {
          // User is genuinely pending - show the page
          setIsValidPending(true);
        }
      } catch (error) {
        console.error("Initial status check failed:", error);
        // On error, redirect to sign-in for safety
        router.replace("/sign-in");
      }
    };

    checkInitialStatus();
  }, [isLoaded, user, router]);

  // Check status every 5 seconds (only if user is valid pending)
  useEffect(() => {
    if (!isValidPending) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/users/check-status");
        const data = await response.json();

        if (data.status === "active") {
          router.replace("/");
        } else if (data.status === "rejected") {
          router.replace("/rejected");
        } else if (data.status === "not_found") {
          // User was deleted from database
          router.replace("/sign-up");
        }
      } catch (error) {
        console.error("Status check failed:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isValidPending, router]);

  // Show loading while checking status
  if (!isLoaded || !isValidPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 rounded-full border-t-transparent" />
          <span className="text-gray-600">Checking account status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-amber-100 rounded-full">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Account Pending Approval
        </h1>

        {user && (
          <div className="my-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-3">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || "User"}
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-teal-600 flex items-center justify-center text-white text-xl font-medium">
                  {user.fullName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <p className="font-medium text-gray-900">{user.fullName}</p>
            <p className="text-sm text-gray-500">{user.emailAddresses[0]?.emailAddress}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              Pending
            </span>
          </div>
        )}

        <p className="text-gray-600 mb-4">
          Your account has been created successfully and is awaiting admin approval.
        </p>

        <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">What happens next:</p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-teal-600">•</span>
              An administrator will review your registration
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600">•</span>
              You'll be notified once your account is approved
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600">•</span>
              This page will automatically update when approved
            </li>
          </ul>
        </div>

        <p className="text-xs text-gray-400 mb-6">
          Checking for approval every 5 seconds...
        </p>

        <button
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
