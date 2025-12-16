import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Temporary placeholder - replace with actual auth when Clerk is re-enabled
const CURRENT_USER_ID = 'User';

export async function GET() {
  try {
    // Get current user's data from Supabase
    const { data: userData } = await supabase
      .from("users")
      .select("id, name, email, role, status")
      .eq("id", CURRENT_USER_ID)
      .single();

    if (!userData) {
      // Return a default user if not found
      return NextResponse.json({
        id: CURRENT_USER_ID,
        name: "User",
        email: "user@example.com",
        role: "superadmin",
        status: "active"
      });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    // Return default user on error
    return NextResponse.json({
      id: CURRENT_USER_ID,
      name: "User",
      email: "user@example.com",
      role: "superadmin",
      status: "active"
    });
  }
}
