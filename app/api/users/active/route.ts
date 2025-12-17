import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// This endpoint returns active users with minimal info (id, name, email, image_url)
// Any authenticated user can access this for dropdowns and display purposes
export async function GET() {
  const user = await currentUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get active users only with minimal fields
  const { data: users, error } = await supabase
    .from("users")
    .select("id, name, email, image_url")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch active users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  return Response.json(users || []);
}
