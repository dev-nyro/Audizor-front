"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { uploadAndProcessFile } from "@/lib/upload-handler"

interface UseFileUploadOptions {
  selectedFolder: string | null;
  onUploadSuccess?: () => void;
  maxFileSize?: number; // in bytes
}

export function useFileUpload({ 
  selectedFolder, 
  onUploadSuccess, 
  maxFileSize = 100 * 1024 * 1024 // Default 100MB
}: UseFileUploadOptions) {
  // State
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  
  // File upload handler using upload function
  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      const result = await uploadAndProcessFile(
        file,
        selectedFolder,
        (progress) => setUploadProgress(progress),
        (error) => toast.error(`Upload error: ${error.message}`)
      )
      
      if (result.success) {
        toast.success(`"${file.name}" uploaded successfully and is being processed`)
        if (onUploadSuccess) {
          onUploadSuccess()
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Upload failed. Please try again later.")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [selectedFolder, onUploadSuccess])

  // Handle multiple files drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return
    
    // Check if files are audio or video
    const validFiles = acceptedFiles.filter(file =>
      file.type.startsWith('audio/') || file.type.startsWith('video/')
    )
    
    if (validFiles.length !== acceptedFiles.length) {
      toast.warning("Some files were not uploaded. Only audio and video files are supported.")
    }
    
    // Upload each valid file sequentially
    for (const file of validFiles) {
      await uploadFile(file)
    }
  }, [uploadFile])

  // Setup dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': [],
      'video/*': [],
    },
    maxSize: maxFileSize,
    onDropRejected: (rejections) => {
      rejections.forEach(rejection => {
        const { file, errors } = rejection
        
        if (errors[0]?.code === "file-too-large") {
          toast.error(`"${file.name}" is too large. Maximum file size is ${maxFileSize / 1024 / 1024}MB.`)
        } else {
          toast.error(`"${file.name}" was rejected: ${errors[0]?.message || "Unknown error"}`)
        }
      })
    }
  })

  // Handle manual file input change
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      toast.error("Only audio and video files are supported")
      return
    }
    
    if (file.size > maxFileSize) {
      toast.error(`"${file.name}" is too large. Maximum file size is ${maxFileSize / 1024 / 1024}MB.`)
      return
    }
    
    await uploadFile(file)
    
    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = ""
    }
  }, [uploadFile, maxFileSize])

  return {
    isUploading,
    uploadProgress,
    uploadFile,
    handleFileUpload,
    getRootProps,
    getInputProps,
    isDragActive,
  }
}
