import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Exporta el cliente por defecto para el lado del cliente:
export const supabase = createSupabaseClient(supabaseUrl!, supabaseAnonKey!)

// Exporta una función que retorne una nueva instancia del cliente (renombrada para evitar conflicto):
export function createClientInstance() {
  return createSupabaseClient(supabaseUrl!, supabaseAnonKey!)
}

// Función para crear un cliente para componentes del lado del cliente:
export function createBrowserSupabaseClient() {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!)
}

