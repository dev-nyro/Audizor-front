import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

// POST handler - Move files to a different folder
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

    const { fileIds, targetFolderId } = await request.json()

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: "No file IDs provided" }, { status: 400 })
    }

    // If targetFolderId is empty string, set it to null (root folder)
    const folderId = targetFolderId === "" ? null : targetFolderId;

    // Verify target folder exists or is null (root)
    if (folderId) {
      const { data: folder, error: folderError } = await supabase
        .from("carpetas")
        .select("id")
        .eq("id", folderId)
        .eq("usuario_id", user.id)
        .single();

      if (folderError || !folder) {
        return NextResponse.json({ error: "Target folder not found" }, { status: 404 })
      }
    }

    // Update files in database
    const { error: updateError } = await supabase
      .from("archivos_subidos")
      .update({ carpeta_id: folderId })
      .in("id", fileIds)
      .eq("usuario_id", user.id) // Security: Only allow move of own files

    if (updateError) {
      console.error("Error moving files:", updateError)
      return NextResponse.json({ error: "Failed to move files" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Files moved successfully",
      targetFolder: folderId
    })
  } catch (error) {
    console.error("Error processing move request:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred during file move" },
      { status: 500 }
    )
  }
}