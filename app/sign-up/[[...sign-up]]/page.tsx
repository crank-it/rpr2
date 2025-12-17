"use client";

import { SignUp, useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shield, User, Check } from "lucide-react";

const roleOptions = [
  {
    value: "admin",
    label: "Admin",
    description: "Full access to all features and user management",
    icon: Shield,
  },
  {
    value: "user",
    label: "User",
    description: "Limited access to view and basic operations",
    icon: User,
  },
];

export default function SignUpPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleUseDifferentAccount = async () => {
    localStorage.removeItem("signupRequestedRole");
    await signOut({ redirectUrl: "/sign-in" });
  };

  useEffect(() => {
    // Check if role already selected (user came back from OAuth)
    const savedRole = localStorage.getItem("signupRequestedRole");
    if (savedRole) {
      setSelectedRole(savedRole);
      setShowSignUp(true);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // If user is already signed in AND has selected a role, redirect to callback
    // Otherwise, let them stay on this page to select a role first
    if (isLoaded && user) {
      const savedRole = localStorage.getItem("signupRequestedRole");
      if (savedRole) {
        setIsRedirecting(true);
        router.replace("/sign-up/callback");
      }
      // If no role selected, don't redirect - let them select a role first
    }
  }, [isLoaded, user, router]);

  const handleContinue = () => {
    if (selectedRole) {
      localStorage.setItem("signupRequestedRole", selectedRole);
      // If user is already signed in (came from sign-in without account), go directly to callback
      if (user) {
        setIsRedirecting(true);
        router.replace("/sign-up/callback");
      } else {
        setShowSignUp(true);
      }
    }
  };

  const handleBack = () => {
    localStorage.removeItem("signupRequestedRole");
    setShowSignUp(false);
  };

  if (!isLoaded || isRedirecting || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light tracking-wider text-gray-900" style={{ letterSpacing: '0.1em' }}>
            RPR HAIRCARE
          </h1>
          <p className="text-sm text-gray-500 mt-1">Operations Hub</p>
        </div>

        {!showSignUp ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Select Your Role
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Choose the role that best describes your position. An admin will review your request.
            </p>

            {/* Show signed-in account if user is already authenticated */}
            {user && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.fullName || "User"}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-medium">
                        {user.fullName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.emailAddresses[0]?.emailAddress}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleUseDifferentAccount}
                    className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
                  >
                    Switch
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {roleOptions.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                    selectedRole === role.value
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    selectedRole === role.value ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    <role.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{role.label}</span>
                      {selectedRole === role.value && (
                        <Check className="h-5 w-5 text-teal-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
                selectedRole
                  ? "bg-teal-600 text-white hover:bg-teal-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue
            </button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Already have an account?{" "}
              <a href="/sign-in" className="text-teal-600 hover:underline">
                Sign in
              </a>
            </p>
          </div>
        ) : (
          <div>
            <button
              onClick={handleBack}
              className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              ← Back to role selection
            </button>
            <SignUp
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-lg",
                }
              }}
            />
            <p className="text-xs text-center text-gray-500 mt-4">
              Your account will require admin approval before access is granted.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
