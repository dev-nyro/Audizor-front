import { createServerSupabaseClient } from "./supabase-server"
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

  // Filter files to only include those that exist in the bucket
  const validFiles = [];

  for (const file of data) {
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
      });
    } else {
      // If file doesn't exist, mark it for deletion in the database
      console.warn(`File not found in storage: ${filePath}. Marking for cleanup.`);
      
      // Optional: Delete the record from the database
      // await supabase.from("archivos_subidos").delete().eq("id", file.id);
    }
  }

  return validFiles;
}