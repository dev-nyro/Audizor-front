import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createClient(cookies())
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(requestUrl.origin)
}

export async function POST(request: Request) {
  const supabase = createClient(cookies())
  const { email, name, google_id } = await request.json()

  try {
    // Verificar si el usuario ya existe
    const { data: existingUser, error: queryError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .single()

    if (queryError && queryError.code !== "PGRST116") {
      // Error que no sea "no se encontró el registro"
      return NextResponse.json({ error: "Error al verificar el usuario" }, { status: 500 })
    }

    if (existingUser) {
      return NextResponse.json({ message: "El usuario ya está registrado" }, { status: 400 })
    }

    // Insertar nuevo usuario
    const { data, error } = await supabase.from("usuarios").insert([
      {
        email,
        nombre: name,
        google_id,
        rol: "usuario",
        fecha_creacion: new Date().toISOString(),
      },
    ])

    if (error) throw error

    return NextResponse.json({ message: "Usuario registrado exitosamente" }, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al registrar el usuario" }, { status: 500 })
  }
}

