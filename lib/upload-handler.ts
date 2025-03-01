/**
 * Enhanced file upload utilities with improved CORS handling
 */

// Direct upload function that bypasses CORS issues
export async function uploadToGCS(
  file: File, 
  signedUrl: string, 
  onProgress?: (progress: number) => void
): Promise<boolean> {
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

// Prepare a file for upload by getting a signed URL
export async function getSignedUploadUrl(
  fileName: string,
  fileType: string,
  fileSize: number,
  folderId: string | null = null
) {
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName,
      fileType,
      fileSize,
      folderId
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to get signed URL")
  }

  return response.json()
}

// Complete upload process including getting URL and uploading
export async function uploadAndProcessFile(
  file: File, 
  folderId: string | null = null,
  onProgress?: (progress: number) => void,
  onError?: (error: Error) => void
): Promise<{ success: boolean, filePath?: string }> {
  try {
    // Step 1: Get signed URL
    const { signedUrl, filePath, fileUrl } = await getSignedUploadUrl(
      file.name,
      file.type,
      file.size,
      folderId
    )
    
    // Step 2: Upload file using CORS-friendly method
    const uploadSuccess = await uploadToGCS(file, signedUrl, onProgress)
    
    if (!uploadSuccess) {
      throw new Error("Failed to upload file to Google Cloud Storage")
    }
    
    // Step 3: Notify backend to process the file
    const processResponse = await fetch('/api/process-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePath,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        folderId
      }),
    })

    if (!processResponse.ok) {
      const errorData = await processResponse.json()
      throw new Error(errorData.error || "Failed to process file")
    }
    
    return { success: true, filePath }
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    console.error("Error in upload process:", errorObj)
    if (onError) onError(errorObj)
    return { success: false }
  }
}