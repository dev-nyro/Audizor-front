import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Storage } from "@google-cloud/storage"

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || "{}"),
})

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET || "")

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const supabase = createServerSupabaseClient()

    // Query the transcriptions table using archivo_id
    const { data: transcription, error } = await supabase
      .from("transcriptions")
      .select("*")
      .eq("archivo_id", id)
      .single()

    if (error) {
      console.error("Error fetching transcript:", error)
      return NextResponse.json(
        { error: "Failed to fetch transcript" },
        { status: 500 }
      )
    }

    if (!transcription) {
      return NextResponse.json({ error: "Transcript not found" }, { status: 404 })
    }

    // Return the transcript data
    return NextResponse.json({
      texto_transcripcion: transcription.texto_transcripcion,
      status: transcription.estado,
      language: transcription.idioma,
      generatedAt: transcription.fecha_generacion,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
