"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallback() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);
  const [noAccount, setNoAccount] = useState(false);

  useEffect(() => {
    // Prevent multiple checks
    if (!isLoaded || !user || hasChecked) return;

    const checkUser = async () => {
      setHasChecked(true);

      try {
        const response = await fetch("/api/users/check-status");
        const data = await response.json();

        if (data.status && data.status !== "not_found") {
          // User exists, redirect based on status
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
          }
          return;
        }

        // User not found - check if they have a role in localStorage (from sign-up flow)
        const requestedRole = localStorage.getItem("signupRequestedRole");

        if (requestedRole) {
          // They selected a role, sync them to database
          const syncResponse = await fetch("/api/auth/sync-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestedRole }),
          });

          const syncData = await syncResponse.json();

          if (syncResponse.ok) {
            localStorage.removeItem("signupRequestedRole");

            if (syncData.status === "active") {
              router.replace("/");
            } else {
              router.replace("/pending");
            }
            return;
          }
        }

        // No role selected - show message
        setNoAccount(true);
      } catch (error) {
        console.error("Auth callback failed:", error);
        router.replace("/sign-in");
      }
    };

    checkUser();
  }, [isLoaded, user, hasChecked, router]);

  const handleGoToSignUp = () => {
    // Don't sign out - just redirect to sign-up to select a role
    // The user is already authenticated, they just need to select a role
    router.replace("/sign-up");
  };

  const handleUseDifferentAccount = async () => {
    // Sign out and redirect to sign-in to try a different account
    await signOut({ redirectUrl: "/sign-in" });
  };

  if (noAccount) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Account Found</h2>

          {user && (
            <p className="text-sm text-gray-500 mb-4">
              Signed in as: {user.emailAddresses[0]?.emailAddress}
            </p>
          )}

          <p className="text-gray-600 mb-6">
            This account doesn't exist in our system yet. Create an account or try a different one.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleGoToSignUp}
              className="w-full bg-teal-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Create Account
            </button>
            <button
              onClick={handleUseDifferentAccount}
              className="w-full bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Use Different Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 rounded-full border-t-transparent" />
        <span className="text-gray-600">Verifying your account...</span>
      </div>
    </div>
  );
}
