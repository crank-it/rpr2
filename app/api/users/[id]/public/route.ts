import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// This endpoint returns basic public info for a single user
// Any authenticated user can access this for display purposes
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: userData, error } = await supabase
    .from("users")
    .select("id, name, email, image_url, status")
    .eq("id", id)
    .single();

  if (error || !userData) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json(userData);
}
