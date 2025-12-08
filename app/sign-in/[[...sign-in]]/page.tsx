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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light tracking-wider text-gray-900" style={{ letterSpacing: '0.1em' }}>
            RPR HAIRCARE
          </h1>
          <p className="text-sm text-gray-500 mt-1">Operations Hub</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg",
            }
          }}
        />
      </div>
    </div>
  );
}
