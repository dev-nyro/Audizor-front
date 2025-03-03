import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

// Simplified folders API with better error handling
export async function GET(request: Request) {
  const supabase = createServerSupabaseClient()

  try {
    // Check if the user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch folders from the database - corrected to use only existing columns
    const { data: foldersData, error: foldersError } = await supabase
      .from("carpetas")
      .select("id, nombre, fecha_creacion")
      .eq("usuario_id", user.id)
      .order("nombre", { ascending: true })

    if (foldersError) {
      console.error("Error fetching folders:", foldersError)
      return NextResponse.json({ 
        error: "Failed to fetch folders", 
        details: foldersError.message 
      }, { status: 500 })
    }

    // Transform to frontend format - removed parentId since carpeta_padre_id doesn't exist
    const folders = foldersData.map(folder => ({
      id: folder.id,
      name: folder.nombre,
      createdAt: new Date(folder.fecha_creacion).toLocaleString(),
      fileCount: 0 // Initialize with 0 to avoid errors
    }));

    return NextResponse.json({ folders })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json(
      { 
        error: "An unexpected error occurred", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}

// POST handler - Create a new folder
export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()

  try {
    // Check if the user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 })
    }

    // Create folder in database - removed carpeta_padre_id
    const { data: folder, error: createError } = await supabase
      .from("carpetas")
      .insert({
        nombre: name.trim(),
        usuario_id: user.id,
        fecha_creacion: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating folder:", createError)
      return NextResponse.json({ 
        error: "Failed to create folder",
        details: createError.message
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      folder: {
        id: folder.id,
        name: folder.nombre,
        createdAt: new Date(folder.fecha_creacion).toLocaleString(),
        fileCount: 0
      }
    })
  } catch (error) {
    console.error("Error processing folder creation:", error)
    return NextResponse.json(
      { 
        error: "An unexpected error occurred while creating folder",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}