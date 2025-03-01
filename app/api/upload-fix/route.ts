import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
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

    // Configure the signed URL with additional options for CORS
    const options = {
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: fileType,
      // Add CORS-friendly headers
      extensionHeaders: {
        // These don't actually solve CORS issues (that needs to be done on the bucket)
        // but they indicate our intent
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PUT",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    }

    // Generate signed URL for upload
    const [signedUrl] = await bucket.file(filePath).getSignedUrl(options)

    // Return the signed URL for the client to upload to directly
    return NextResponse.json({ 
      success: true, 
      signedUrl, 
      filePath,
      fileUrl: `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${filePath}`
    })
  } catch (error) {
    console.error("Error preparing file upload:", error)
    return NextResponse.json({ 
      error: "Error preparing file upload", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}