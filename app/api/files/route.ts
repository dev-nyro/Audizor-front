import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Storage } from "@google-cloud/storage"

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || "{}"),
})

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET || "")

// Function to check if a file exists in the GCS bucket
async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    const [exists] = await bucket.file(filePath).exists();
    return exists;
  } catch (error) {
    console.error(`Error checking if file exists: ${filePath}`, error);
    return false;
  }
}

// Extract GCS file path from full URL
function extractFilePath(url: string): string {
  if (!url) return "";
  
  const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || "";
  const prefix = `https://storage.googleapis.com/${bucketName}/`;
  
  if (url.startsWith(prefix)) {
    return url.substring(prefix.length);
  }
  
  return url;
}

// GET handler - Get all files for the current user
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

    // Fetch files from the database
    const { data: filesData, error: filesError } = await supabase
      .from("archivos_subidos")
      .select("*")
      .eq("usuario_id", user.id)
      .order("fecha_subida", { ascending: false })

    if (filesError) {
      console.error("Error fetching files:", filesError)
      return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
    }

    // Validate files - check if they exist in storage
    const validFiles = [];

    for (const file of filesData) {
      const filePath = extractFilePath(file.ruta_archivo);
      const exists = await checkFileExists(filePath);
      
      if (exists) {
        validFiles.push({
          id: file.id,
          name: file.nombre_archivo,
          type: file.tipo,
          size: file.tamano,
          lastModified: new Date(file.fecha_subida).toLocaleString(),
          url: file.ruta_archivo,
          transcriptUrl: file.ruta_transcripcion,
          status: file.estado_procesamiento || 'processing',
          folderId: file.carpeta_id,
          thumbnailUrl: file.ruta_miniatura,
        });
      } else {
        // If file doesn't exist, we could mark it for cleanup here
        console.warn(`File not found in storage: ${filePath}. Not including in results.`);
      }
    }

    return NextResponse.json({ files: validFiles })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

// DELETE handler - Delete files by ID
export async function DELETE(request: Request) {
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

    const { fileIds } = await request.json()

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: "No file IDs provided" }, { status: 400 })
    }

    // Get file data to check for files to remove from storage
    const { data: filesData, error: fetchError } = await supabase
      .from("archivos_subidos")
      .select("*")
      .in("id", fileIds)
      .eq("usuario_id", user.id) // Security: Only allow deletion of own files

    if (fetchError) {
      console.error("Error fetching files for deletion:", fetchError)
      return NextResponse.json({ error: "Failed to fetch files for deletion" }, { status: 500 })
    }

    // Delete files from storage
    for (const file of filesData) {
      if (file.ruta_archivo) {
        const filePath = extractFilePath(file.ruta_archivo);
        try {
          await bucket.file(filePath).delete();
          console.log(`Deleted file from storage: ${filePath}`);
        } catch (error) {
          console.warn(`Error deleting file from storage: ${filePath}`, error);
          // Continue deletion process even if storage deletion fails
        }
      }

      // Also delete transcript file if it exists
      if (file.ruta_transcripcion) {
        const transcriptPath = extractFilePath(file.ruta_transcripcion);
        try {
          await bucket.file(transcriptPath).delete();
          console.log(`Deleted transcript from storage: ${transcriptPath}`);
        } catch (error) {
          console.warn(`Error deleting transcript from storage: ${transcriptPath}`, error);
        }
      }

      // Delete thumbnail if it exists
      if (file.ruta_miniatura) {
        const thumbnailPath = extractFilePath(file.ruta_miniatura);
        try {
          await bucket.file(thumbnailPath).delete();
          console.log(`Deleted thumbnail from storage: ${thumbnailPath}`);
        } catch (error) {
          console.warn(`Error deleting thumbnail from storage: ${thumbnailPath}`, error);
        }
      }
    }

    // Delete files from database
    const { error: deleteError } = await supabase
      .from("archivos_subidos")
      .delete()
      .in("id", fileIds)
      .eq("usuario_id", user.id) // Security: Only allow deletion of own files

    if (deleteError) {
      console.error("Error deleting files from database:", deleteError)
      return NextResponse.json({ error: "Failed to delete files from database" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Files deleted successfully" })
  } catch (error) {
    console.error("Error processing delete request:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred during file deletion" },
      { status: 500 }
    )
  }
}