"use client";

import { useClerk } from "@clerk/nextjs";
import { UserX, LogOut } from "lucide-react";

export default function RejectedPage() {
  const { signOut } = useClerk();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 rounded-full">
            <UserX className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-red-600 mb-2">
          Access Denied
        </h1>

        <p className="text-gray-600 mb-4">
          Your registration request has been rejected by an administrator.
        </p>

        <p className="text-gray-500 text-sm mb-6">
          You do not have access to this platform. If you believe this is an error, please contact the administrator.
        </p>

        <button
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
