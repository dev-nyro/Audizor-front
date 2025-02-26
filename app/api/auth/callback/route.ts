import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) throw error

      // Verificar si el usuario ya existe en la tabla 'usuarios'
      const { data: existingUser, error: queryError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (queryError && queryError.code !== "PGRST116") {
        // Error que no sea "no se encontró el registro"
        throw queryError
      }

      if (!existingUser) {
        // Si el usuario no existe, insertarlo en la tabla 'usuarios'
        const { error: insertError } = await supabase.from("usuarios").insert([
          {
            id: data.user.id,
            email: data.user.email,
            nombre: data.user.user_metadata.full_name || data.user.email,
            google_id: data.user.app_metadata.provider === "google" ? data.user.identities[0].id : null,
            rol: "usuario",
            fecha_creacion: new Date().toISOString(),
          },
        ])

        if (insertError) throw insertError
      }

      // Redirigir al usuario a la página de dashboard
      return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
    } catch (error) {
      console.error("Error during Google authentication:", error)
      // Redirigir al usuario a la página de login con un mensaje de error
      return NextResponse.redirect(new URL("/login?error=AuthError", requestUrl.origin))
    }
  }

  // Si no hay código, redirigir a la página de inicio
  return NextResponse.redirect(new URL("/", requestUrl.origin))
}

