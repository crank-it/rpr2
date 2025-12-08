"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignUpCallback() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noRoleSelected, setNoRoleSelected] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user || hasChecked) return;

    const syncUser = async () => {
      setHasChecked(true);

      // First check if user already exists in database
      try {
        const statusResponse = await fetch("/api/users/check-status");
        const statusData = await statusResponse.json();

        if (statusData.status && statusData.status !== "not_found") {
          // User already exists, redirect based on status
          switch (statusData.status) {
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
      } catch (err) {
        console.error("Status check failed:", err);
      }

      // User doesn't exist - check if they selected a role
      const requestedRole = localStorage.getItem("signupRequestedRole");

      if (!requestedRole) {
        // No role selected - they need to go through proper sign-up
        setNoRoleSelected(true);
        return;
      }

      try {
        // Sync user to database with selected role
        const response = await fetch("/api/auth/sync-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestedRole }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to sync user");
        }

        // Clear localStorage after successful sync
        localStorage.removeItem("signupRequestedRole");

        // Redirect based on status
        switch (data.status) {
          case "active":
            router.replace("/");
            break;
          case "rejected":
            router.replace("/rejected");
            break;
          case "deactivated":
            router.replace("/deactivated");
            break;
          default:
            router.replace("/pending");
        }
      } catch (err) {
        console.error("Sync failed:", err);
        setError(err instanceof Error ? err.message : "Failed to create account");
      }
    };

    syncUser();
  }, [isLoaded, user, hasChecked, router]);

  const handleGoToSignUp = async () => {
    await signOut();
    router.replace("/sign-up");
  };

  if (noRoleSelected) {
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
          <p className="text-gray-600 mb-6">
            It looks like you don't have an account yet. Please sign up and select a role to create your account.
          </p>
          <button
            onClick={handleGoToSignUp}
            className="w-full bg-teal-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Go to Sign Up
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.replace("/sign-up")}
            className="mt-4 w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 rounded-full border-t-transparent" />
        <span className="text-gray-600">Creating your account...</span>
      </div>
    </div>
  );
}
