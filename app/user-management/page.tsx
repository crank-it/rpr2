"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Crown,
  Shield,
  User as UserIcon,
  Users,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import { User } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Role badge configuration
const roleConfig = {
  superadmin: {
    label: "Superadmin",
    bg: "bg-violet-100",
    text: "text-violet-700",
    icon: Crown,
  },
  admin: {
    label: "Admin",
    bg: "bg-red-100",
    text: "text-red-700",
    icon: Shield,
  },
  user: {
    label: "User",
    bg: "bg-gray-100",
    text: "text-gray-700",
    icon: UserIcon,
  },
};

function RoleBadge({ role }: { role: string }) {
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function UserAvatar({ user, size = "md" }: { user: User; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl",
  };

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-medium overflow-hidden`}>
      {user.image_url ? (
        <img src={user.image_url} alt={user.name || "User"} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

export default function UserManagementPage() {
  const { user: clerkUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejected, setShowRejected] = useState(false);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();

      if (data.users) {
        setUsers(data.users);
        // Find current user's role
        const currentUser = data.users.find((u: User) => u.id === clerkUser?.id);
        setCurrentUserRole(currentUser?.role || null);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch("/api/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, action: "approve" }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to approve user:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch("/api/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, action: "reject" }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to reject user:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter users by status (exclude superadmins from display)
  const pendingUsers = users.filter((u) => u.status === "pending" && u.role !== "superadmin");
  const activeUsers = users.filter((u) => (u.status === "active" || u.status === "deactivated") && u.role !== "superadmin");
  const rejectedUsers = users.filter((u) => u.status === "rejected" && u.role !== "superadmin");

  // Check if current user can manage users
  const canManageUsers = currentUserRole === "superadmin" || currentUserRole === "admin";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 rounded-full border-t-transparent" />
      </div>
    );
  }

  if (!canManageUsers) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <ShieldAlert className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500">You don't have permission to access User Management.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage users, roles, and approvals</p>
      </div>

      {/* Pending Approvals Section */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
          {pendingUsers.length > 0 && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              {pendingUsers.length}
            </Badge>
          )}
        </div>

        {pendingUsers.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
            <p className="font-medium text-gray-900">No pending approvals</p>
            <p className="text-sm text-gray-500">All user requests have been processed</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingUsers.map((user) => (
              <div key={user.id} className="border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <UserAvatar user={user} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.name || "No name"}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Registered: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(user.id)}
                    disabled={actionLoading === user.id}
                  >
                    {actionLoading === user.id ? "..." : "Approve"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleReject(user.id)}
                    disabled={actionLoading === user.id}
                  >
                    {actionLoading === user.id ? "..." : "Reject"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Users Table Section */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500">Manage team members and their roles</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activeUsers.map((user) => {
                const isCurrentUser = user.id === clerkUser?.id;
                const isSuperadmin = user.role === "superadmin";
                const canModify = !isCurrentUser && (currentUserRole === "superadmin" || !isSuperadmin);

                return (
                  <tr key={user.id} className={user.status === "deactivated" ? "bg-gray-50 opacity-60" : ""}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name || "No name"}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-teal-600">(You)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      {canModify ? (
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          disabled={actionLoading === user.id}
                          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
                        >
                          <option value="active">Active</option>
                          <option value="deactivated">Deactivated</option>
                        </select>
                      ) : (
                        <span className={`text-sm ${user.status === "active" ? "text-green-600" : "text-gray-500"}`}>
                          {user.status === "active" ? "Active" : "Deactivated"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {canModify ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={actionLoading === user.id}
                          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
                        >
                          <option value="admin">Admin</option>
                          <option value="user">User</option>
                        </select>
                      ) : (
                        <span className="text-sm text-gray-400">
                          {isCurrentUser ? "Current User" : "Protected"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Role Descriptions Section */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-5 w-5 text-violet-600" />
            <h3 className="font-semibold text-gray-900">Superadmin</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">Unrestricted access to everything:</p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• All Admin capabilities</li>
            <li>• Assign/remove Superadmin role</li>
            <li>• No permission restrictions</li>
            <li>• Cannot be modified by Admin</li>
          </ul>
        </div> */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-gray-900">Admin</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">Full access including:</p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• User management</li>
            <li>• Approve/reject users</li>
            <li>• Change user roles & status</li>
            <li>• All core features</li>
          </ul>
          <p className="text-xs text-gray-400 mt-2">Cannot assign Superadmin role</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <UserIcon className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">User</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">Limited access:</p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• View dashboard & data</li>
            <li>• Basic operations</li>
            <li>• No User Management access</li>
            <li>• No admin features</li>
          </ul>
        </div>
      </section>

      {/* Rejected Users Section */}
      {rejectedUsers.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setShowRejected(!showRejected)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">Rejected Users</h2>
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                {rejectedUsers.length}
              </Badge>
            </div>
            {showRejected ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {showRejected && (
            <div className="border-t p-4 space-y-3">
              {rejectedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 opacity-60">
                  <UserAvatar user={user} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.name || "No name"}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    Rejected
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
