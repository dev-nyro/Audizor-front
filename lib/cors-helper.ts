// Helper for configuring CORS for Google Cloud Storage
import { Storage } from "@google-cloud/storage"

export async function configureGCPBucketCORS() {
  const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || "{}"),
  })

  const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET || "")

  try {
    // Set CORS configuration for the bucket
    await bucket.setCorsConfiguration([
      {
        maxAgeSeconds: 3600,
        method: ["GET", "PUT", "POST", "DELETE", "HEAD"],
        origin: ["*"], // In production, you should restrict this to your domains
        responseHeader: [
          "Content-Type",
          "Content-Length",
          "Content-Encoding",
          "Content-Disposition",
          "Cache-Control",
          "x-goog-meta-*",
          "Access-Control-Allow-Origin"
        ],
      },
    ])
    
    return { success: true }
  } catch (error) {
    console.error("Error setting CORS for GCP bucket:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }
  }
}

// Direct upload function that bypasses CORS issues
export async function uploadToGCS(file: File, signedUrl: string, 
  onProgress?: (progress: number) => void): Promise<boolean> {
  try {
    // Use regular fetch API which handles CORS better than XMLHttpRequest
    const response = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file
    })
    
    // Set to 100% when upload completes
    if (onProgress) onProgress(100)
    
    return response.ok
  } catch (error) {
    console.error("Error uploading to GCS:", error)
    return false
  }
}