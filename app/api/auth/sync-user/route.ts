import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Admin emails that get auto-approved as superadmin
const ADMIN_EMAILS = ["admin@rprhaircare.com"]; // Update with your admin emails

// Valid roles that users can request
const VALID_ROLES = ["admin", "user"];

export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get requested role from request body
  let requestedRole = "user";
  try {
    const body = await request.json();
    if (body.requestedRole && VALID_ROLES.includes(body.requestedRole)) {
      requestedRole = body.requestedRole;
    }
  } catch {
    // If no body, default to 'user'
  }

  const email = user.emailAddresses[0]?.emailAddress || "";
  const isAdminEmail = ADMIN_EMAILS.includes(email);

  // Admin emails get superadmin role and auto-approved
  const role = isAdminEmail ? "superadmin" : requestedRole;
  const status = isAdminEmail ? "active" : "pending";

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existingUser) {
    // User already exists, just return their status
    const { data: userData } = await supabase
      .from("users")
      .select("status")
      .eq("id", user.id)
      .single();

    return Response.json({ success: true, status: userData?.status || "pending" });
  }

  // Insert new user
  const { error } = await supabase.from("users").insert({
    id: user.id,
    name: user.fullName,
    email: email,
    image_url: user.imageUrl,
    role,
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to sync user:", error);
    return Response.json({ error: "Failed to sync user" }, { status: 500 });
  }

  // Update Clerk metadata with role
  const client = await clerkClient();
  await client.users.updateUserMetadata(user.id, {
    publicMetadata: { role },
  });

  return Response.json({ success: true, status });
}
