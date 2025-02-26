import { createServerSupabaseClient } from "./supabase"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    redirect("/login")
  }

  return session
}

