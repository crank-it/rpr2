import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Admin emails that have approval rights
const ADMIN_EMAILS = ["admin@rprhaircare.com"]; // Update with your admin emails

export async function POST(request: Request) {
  const admin = await currentUser();

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

  const adminEmail = admin.emailAddresses[0]?.emailAddress;
  const isAdmin =
    adminUser?.role === "superadmin" ||
    adminUser?.role === "admin" ||
    ADMIN_EMAILS.includes(adminEmail || "");

  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Get request body
  let targetUserId: string;
  let action: string;

  try {
    const body = await request.json();
    targetUserId = body.targetUserId || body.userId;
    action = body.action;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!targetUserId || !["approve", "reject"].includes(action)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const newStatus = action === "approve" ? "active" : "rejected";

  const { error } = await supabase
    .from("users")
    .update({
      status: newStatus,
      approved_by: admin.id,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetUserId);

  if (error) {
    console.error("Failed to update user:", error);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }

  return Response.json({ success: true, status: newStatus });
}
