"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Crown, Shield, User as UserIcon, ShieldAlert } from "lucide-react";
import { User } from "@/lib/supabase";

// Role configuration
const roleConfig = {
  superadmin: { label: "Superadmin", icon: Crown },
  admin: { label: "Admin", icon: Shield },
  user: { label: "User", icon: UserIcon },
};

export default function UserManagementPage() {
  const { user: clerkUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();

      if (data.users) {
        setUsers(data.users);
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
      if (response.ok) fetchUsers();
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
      if (response.ok) fetchUsers();
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
      if (response.ok) fetchUsers();
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
      if (response.ok) fetchUsers();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingUsers = users.filter((u) => u.status === "pending" && u.role !== "superadmin");
  const activeUsers = users.filter((u) => (u.status === "active" || u.status === "deactivated") && u.role !== "superadmin");

  const canManageUsers = currentUserRole === "superadmin" || currentUserRole === "admin";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-6 w-6 border-2 border-solid border-foreground border-r-transparent rounded-full" />
      </div>
    );
  }

  if (!canManageUsers) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="text-center py-16">
            <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-medium text-foreground mb-2">Access Denied</h2>
            <p className="text-sm text-muted-foreground">You don't have permission to access User Management.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-normal text-foreground tracking-tight mb-3">
            Users
          </h1>
          <p className="text-sm text-muted-foreground">
            {activeUsers.length} active · {pendingUsers.length} pending
          </p>
        </div>

        {/* Pending Approvals */}
        {pendingUsers.length > 0 && (
          <div className="mb-20">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-8">
              Pending Approval
            </h2>
            <div className="space-y-0">
              {pendingUsers.map((user, index) => (
                <div key={user.id}>
                  <div className="py-6">
                    <div className="flex items-baseline justify-between gap-8">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-foreground mb-1">
                          {user.name || "No name"}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{user.email}</span>
                          <span>·</span>
                          <span>{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(user.id)}
                          disabled={actionLoading === user.id}
                          className="text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <span className="text-muted-foreground">·</span>
                        <button
                          onClick={() => handleReject(user.id)}
                          disabled={actionLoading === user.id}
                          className="text-sm text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                  {index < pendingUsers.length - 1 && <div className="h-px bg-border" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Users */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-8">
            Active Users
          </h2>
          <div className="space-y-0">
            {activeUsers.map((user, index) => {
              const isCurrentUser = user.id === clerkUser?.id;
              const isSuperadmin = user.role === "superadmin";
              const canModify = !isCurrentUser && (currentUserRole === "superadmin" || !isSuperadmin);
              const config = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.user;

              return (
                <div key={user.id}>
                  <div className={`py-6 ${user.status === "deactivated" ? "opacity-40" : ""}`}>
                    <div className="flex items-baseline justify-between gap-8">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-foreground mb-1">
                          {user.name || "No name"}
                          {isCurrentUser && (
                            <span className="ml-2 text-sm text-primary">(You)</span>
                          )}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{user.email}</span>
                          <span>·</span>
                          <span>{config.label}</span>
                          <span>·</span>
                          <span>{user.status === "active" ? "Active" : "Deactivated"}</span>
                        </div>
                      </div>
                      {canModify && (
                        <div className="flex items-center gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            disabled={actionLoading === user.id}
                            className="text-sm border-0 border-b border-border bg-transparent py-1 text-foreground focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                          >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                          </select>
                          <span className="text-muted-foreground">·</span>
                          <select
                            value={user.status}
                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                            disabled={actionLoading === user.id}
                            className="text-sm border-0 border-b border-border bg-transparent py-1 text-foreground focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                          >
                            <option value="active">Active</option>
                            <option value="deactivated">Deactivated</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < activeUsers.length - 1 && <div className="h-px bg-border" />}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
