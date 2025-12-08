import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await currentUser();
  const { id: targetUserId } = await params;

  if (!admin) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if current user is admin/superadmin
  const { data: adminUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", admin.id)
    .single();

  if (!adminUser || !["superadmin", "admin"].includes(adminUser.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Get the target user
  const { data: targetUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", targetUserId)
    .single();

  if (!targetUser) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Parse request body
  let updates: { role?: string; status?: string };
  try {
    updates = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Only superadmin can modify superadmin role
  if (updates.role === "superadmin" && adminUser.role !== "superadmin") {
    return Response.json(
      { error: "Only superadmins can assign superadmin role" },
      { status: 403 }
    );
  }

  // Can't modify another superadmin unless you're superadmin
  if (targetUser.role === "superadmin" && adminUser.role !== "superadmin") {
    return Response.json(
      { error: "Cannot modify superadmin users" },
      { status: 403 }
    );
  }

  // Update user
  const { error } = await supabase
    .from("users")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetUserId);

  if (error) {
    console.error("Failed to update user:", error);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }

  return Response.json({ success: true });
}
