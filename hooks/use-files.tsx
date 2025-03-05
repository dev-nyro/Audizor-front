"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { useFileUpload } from "./use-fileupload"

export interface FileType {
  id?: string;
  name: string;
  type: string;
  size: number;
  lastModified: string;
  url?: string;
  transcriptUrl?: string;
  status?: 'completed' | 'processing' | 'error';
  folderId?: string;
  thumbnailUrl?: string;
}

interface UseFilesOptions {
  initialFiles?: FileType[];
  selectedFolder: string | null;
  getFolderName: (folderId: string | undefined) => string;
}

export function useFiles({ initialFiles = [], selectedFolder, getFolderName }: UseFilesOptions) {
  // State
  const [files, setFiles] = useState<FileType[]>(initialFiles)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "name" | "size" | "type">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [filterType, setFilterType] = useState<"all" | "audio" | "video" | "unprocessed">("all")

  // Fetch user files from API
  const fetchUserFiles = useCallback(async () => {
    try {
      const response = await fetch('/api/files')
      if (response.ok) {
        const data = await response.json()
        console.log("Files received from API:", data.files)
        setFiles(data.files || [])
      } else {
        console.error("Error fetching files: Status", response.status)
        toast.error("Could not load your files")
      }
    } catch (error) {
      console.error("Error fetching files:", error)
      toast.error("Could not load your files")
    }
  }, [])

  // Use the new file upload hook
  const {
    isUploading,
    uploadProgress,
    handleFileUpload,
    getRootProps,
    getInputProps,
    isDragActive
  } = useFileUpload({
    selectedFolder,
    onUploadSuccess: fetchUserFiles
  })

  // Filter files based on search, selected folder, and file type filter
  const filteredFiles = useMemo(() => {
    return files
      .filter(file => {
        // Make sure we have files with valid IDs
        if (!file.id) return false;
        
        // Filter by folder
        const folderMatch = selectedFolder 
          ? file.folderId === selectedFolder 
          : !file.folderId || file.folderId === "";
          
        // Filter by search query
        const searchMatch = searchQuery
          ? file.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
          
        // Filter by file type - FIXED to handle types without slashes
        let typeMatch = true;
        if (filterType === "audio") {
          typeMatch = file.type.startsWith("audio") || file.type === "audio";
        } else if (filterType === "video") {
          typeMatch = file.type.startsWith("video") || file.type === "video";
        } else if (filterType === "unprocessed") {
          typeMatch = file.status !== "completed";
        }
        
        return folderMatch && searchMatch && typeMatch;
      })
      // Rest of the sorting logic remains unchanged
      .sort((a, b) => {
        if (sortBy === 'date') {
          const dateA = new Date(a.lastModified).getTime()
          const dateB = new Date(b.lastModified).getTime()
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
        } else if (sortBy === 'name') {
          return sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        } else if (sortBy === 'size') {
          return sortOrder === 'asc' ? a.size - b.size : b.size - a.size
        } else if (sortBy === 'type') {
          return sortOrder === 'asc'
            ? a.type.localeCompare(b.type)
            : b.type.localeCompare(a.type)
        }
        return 0
      })
  }, [files, selectedFolder, searchQuery, sortBy, sortOrder, filterType])

  // File selection operations
  const handleFileSelection = useCallback((fileId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedFiles(prev => [...prev, fileId])
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId))
    }
  }, [])

  const handleSelectAllFiles = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedFiles(filteredFiles.map(file => file.id || '').filter(Boolean))
    } else {
      setSelectedFiles([])
    }
  }, [filteredFiles])

  // File operations
  const moveFilesToFolder = useCallback(async (targetFolderId: string) => {
    if (!selectedFiles.length) return
    try {
      const response = await fetch('/api/move-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileIds: selectedFiles,
          targetFolderId
        }),
      })
      if (response.ok) {
        toast.success("Files moved successfully")
        fetchUserFiles()
        setSelectedFiles([])
      } else {
        const errorData = await response.json()
        toast.error(`Failed to move files: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error moving files:", error)
      toast.error("Could not move files")
    }
  }, [selectedFiles, fetchUserFiles])

  const handleDeleteFile = useCallback((fileId: string) => {
    setFileToDelete(fileId)
    return fileId // Return the ID for the component to use in its state
  }, [])

  const confirmDeleteFile = useCallback(async (fileIdToDelete: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch('/api/files', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileIds: [fileIdToDelete]
        }),
      })
      if (response.ok) {
        toast.success("File deleted successfully")
        fetchUserFiles()
        return true
      } else {
        const errorData = await response.json()
        toast.error(`Failed to delete file: ${errorData.error || "Unknown error"}`)
        return false
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      toast.error("Could not delete file")
      return false
    } finally {
      setIsDeleting(false)
    }
  }, [fetchUserFiles])

  const deleteSelectedFiles = useCallback(async () => {
    if (!selectedFiles.length) return
    if (!confirm(`Are you sure you want to delete ${selectedFiles.length} file(s)?`)) {
      return
    }
    try {
      const response = await fetch('/api/files', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileIds: selectedFiles
        }),
      })
      if (response.ok) {
        toast.success("Files deleted successfully")
        fetchUserFiles()
        setSelectedFiles([])
      } else {
        const errorData = await response.json()
        toast.error(`Failed to delete files: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error deleting files:", error)
      toast.error("Could not delete files")
    }
  }, [selectedFiles, fetchUserFiles])

  // Utility functions
  const getFileIcon = useCallback((fileType: string) => {
    if (fileType.startsWith("audio")) return "audio"
    if (fileType.startsWith("video")) return "video"
    return "document"
  }, [])

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }, [])

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }, [])

  // Load files on initial render
  useEffect(() => {
    fetchUserFiles()
  }, [fetchUserFiles])

  return {
    files,
    filteredFiles,
    selectedFiles,
    searchQuery,
    sortBy,
    sortOrder,
    isUploading,
    uploadProgress,
    isDeleting,
    filterType,
    getRootProps,
    getInputProps,
    isDragActive,
    setSearchQuery,
    setSortBy,
    setFilterType,
    fetchUserFiles,
    handleFileUpload,
    handleFileSelection,
    handleSelectAllFiles,
    moveFilesToFolder,
    handleDeleteFile,
    confirmDeleteFile,
    deleteSelectedFiles,
    getFileIcon,
    formatFileSize,
    toggleSortOrder,
  }
}
