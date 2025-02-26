import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Storage } from "@google-cloud/storage"

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || "{}"),
})

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET || "")

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()

  // Check if the user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { fileName, fileType, fileSize } = await request.json()

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json({ error: "Missing file information" }, { status: 400 })
    }

    const fileCategory = fileType.startsWith("video/") ? "videos" : "audios"

    // Generate the file path
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const timestamp = now.getTime()

    const uniqueFileName = `${fileCategory === "videos" ? "video" : "audio"}_${timestamp}_${fileName}`
    const filePath = `usuarios/${user.id}/${fileCategory}/${year}/${month}/${day}/${uniqueFileName}`

    // Generate signed URL for upload?
    const [signedUrl] = await bucket.file(filePath).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: fileType,
    })

    // Insert file metadata into Supabase
    const { data, error } = await supabase.from("archivos_subidos").insert({
      usuario_id: user.id,
      nombre_archivo: fileName,
      tipo: fileType,
      fecha_subida: now.toISOString(),
      ruta_archivo: `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${filePath}`,
      tamano: fileSize,
    })

    if (error) throw error

    return NextResponse.json({ success: true, signedUrl, filePath })
  } catch (error) {
    console.error("Error preparing file upload:", error)
    return NextResponse.json({ error: "Error preparing file upload" }, { status: 500 })
  }
}

