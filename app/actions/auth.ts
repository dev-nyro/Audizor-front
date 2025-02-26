"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function registerUser(formData: FormData) {
  const supabase = createServerSupabaseClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const nombre = formData.get("nombre") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!email || !password || !nombre || !confirmPassword) {
    return { error: "Todos los campos son requeridos" }
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" }
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError

    if (authData.user) {
      const { error: dbError } = await supabase.from("usuarios").insert([
        {
          id: authData.user.id,
          email,
          nombre,
          rol: "usuario",
          fecha_creacion: new Date().toISOString(),
        },
      ])

      if (dbError) {
        if (dbError.code === "23505" && dbError.message.includes("usuarios_email_key")) {
          return {
            error:
              "Este correo electrónico ya está en uso. Por favor, utiliza otro correo o inicia sesión si ya tienes una cuenta.",
          }
        }
        throw dbError
      }
    }

    revalidatePath("/login")
    return { success: true }
  } catch (error: any) {
    console.error("Error during registration:", error)
    return { error: error.message || "Ha ocurrido un error durante el registro. Por favor, inténtalo de nuevo." }
  }
}

export async function loginUser(formData: FormData) {
  const supabase = createServerSupabaseClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos" }
  }

  try {
    // Primero verificar si el usuario existe en la tabla usuarios
    const { data: userData, error: userError } = await supabase.from("usuarios").select("*").eq("email", email).single()

    if (userError) {
      return { error: "Usuario no encontrado" }
    }

    // Si existe, intentar hacer login
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) throw authError

    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

