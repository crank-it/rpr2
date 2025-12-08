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

  // Try to find user by ID first
  let { data: dbUser } = await supabase
    .from("users")
    .select("status, role")
    .eq("id", user.id)
    .single();

  // Fallback: find by email (for legacy users)
  if (!dbUser) {
    const email = user.emailAddresses[0]?.emailAddress;
    const { data: emailUser } = await supabase
      .from("users")
      .select("id, status, role")
      .eq("email", email)
      .single();

    if (emailUser) {
      // Update the user ID to match Clerk
      await supabase
        .from("users")
        .update({ id: user.id, updated_at: new Date().toISOString() })
        .eq("email", email);

      dbUser = emailUser;
    }
  }

  if (!dbUser) {
    return Response.json({ status: "not_found" });
  }

  return Response.json({
    status: dbUser.status,
    role: dbUser.role,
  });
}
