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
    const { filePath, fileName, fileType, fileSize, folderId } = await request.json()

    if (!filePath || !fileName || !fileType) {
      return NextResponse.json({ error: "Missing file information" }, { status: 400 })
    }

    // Verify file was actually uploaded to Google Cloud Storage
    const fileExists = await checkFileExists(filePath);
    
    if (!fileExists) {
      return NextResponse.json(
        { error: "File upload failed or file not found in storage" }, 
        { status: 400 }
      );
    }

    // File exists in storage, add record to database
    const fileUrl = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${filePath}`;
    
    const { data, error } = await supabase.from("archivos_subidos").insert({
      usuario_id: user.id,
      nombre_archivo: fileName,
      tipo: fileType,
      fecha_subida: new Date().toISOString(),
      ruta_archivo: fileUrl,
      tamano: fileSize || 0,
      carpeta_id: folderId || null,
    }).select();

    if (error) {
      console.error("Error inserting file record:", error);
      return NextResponse.json({ error: "Failed to save file information" }, { status: 500 });
    }

    // Initiate transcription process if it's audio or video
    // (This would be an external call to a transcription service, perhaps a serverless function)
    if (fileType.startsWith('audio/') || fileType.startsWith('video/')) {
      // Example: Call to start transcription process
      // await fetch('https://your-transcription-service.com/start', { 
      //   method: 'POST', 
      //   body: JSON.stringify({ fileUrl, fileId: data[0].id }) 
      // });
      
      console.log(`Initiated transcription process for file: ${fileName}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: "File processed successfully",
      fileId: data?.[0]?.id
    });
    
  } catch (error) {
    console.error("Error processing file:", error)
    return NextResponse.json({ 
      error: "Error processing file", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}