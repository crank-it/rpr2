import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if current user is admin/superadmin
  const { data: currentUserData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentUserData || !["superadmin", "admin"].includes(currentUserData.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Get all users
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  return Response.json({ users });
}
