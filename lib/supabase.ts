import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import type { CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Exporta el cliente por defecto:
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Exporta una función que retorne una nueva instancia del cliente (renombrada para evitar conflicto):
export function createClientInstance() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Cliente para el lado del servidor:
export function createServerSupabaseClient() {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookies().get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookies().set(name, value, options)
      },
      remove(name: string, options: CookieOptions) {
        cookies().set(name, "", { ...options, maxAge: 0 })
      },
    },
  })
}

