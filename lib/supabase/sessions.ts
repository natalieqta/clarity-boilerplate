import { createClient } from "./client";

export interface SessionRow {
  id: string;
  user_email: string;
  module: "how" | "what";
  data: Record<string, unknown>;
  score: number;
  created_at: string;
}

export async function saveSession(
  userEmail: string,
  module: "how" | "what",
  data: Record<string, unknown>,
  score: number
): Promise<SessionRow | null> {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from("sessions")
    .insert({ user_email: userEmail, module, data, score })
    .select()
    .single();
  if (error) {
    console.error("Failed to save session:", error);
    return null;
  }
  return row;
}

export async function getUserSessions(
  userEmail: string,
  limit = 10
): Promise<SessionRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_email", userEmail)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("Failed to fetch sessions:", error);
    return [];
  }
  return data ?? [];
}
