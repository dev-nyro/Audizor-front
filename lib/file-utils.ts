import { createServerSupabaseClient } from "./supabase"

export async function getFilesFromServer() {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error("Not authenticated")
  }

  const { data, error } = await supabase
    .from("archivos_subidos")
    .select("*")
    .eq("usuario_id", user.id)
    .order("fecha_subida", { ascending: false })

  if (error) {
    console.error("Error fetching files:", error)
    return []
  }

  return data.map((file) => ({
    id: file.id,
    name: file.nombre_archivo,
    type: file.tipo,
    size: file.tamano,
    lastModified: new Date(file.fecha_subida).toLocaleString(),
    url: file.ruta_archivo,
    transcription: file.transcripcion,
    transcriptionStatus: file.estado_transcripcion || 'pending',
  }))
}

export async function uploadFile(file: File, userId: string) {
  try {
    // Get signed URL for upload
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get signed URL")
    }

    const { signedUrl, filePath } = await response.json()

    // Upload to signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    })

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file")
    }

    return { success: true, filePath }
  } catch (error) {
    console.error("Upload error:", error)
    throw error
  }
}

export async function getFileTranscription(fileId: string) {
  const supabase = createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from("archivos_subidos")
    .select("transcripcion, estado_transcripcion")
    .eq("id", fileId)
    .single()
    
  if (error) {
    console.error("Error fetching transcription:", error)
    return { transcription: null, status: 'error' }
  }
  
  return {
    transcription: data.transcripcion,
    status: data.estado_transcripcion
  }
}

export function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return "image"
  if (fileType.startsWith("video/")) return "video"
  if (fileType.startsWith("audio/")) return "audio"
  return "document"
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

