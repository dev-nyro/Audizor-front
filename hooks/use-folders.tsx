"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

export interface FolderType {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
  fileCount?: number;
}

export function useFolders() {
  const [folders, setFolders] = useState<FolderType[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch user folders from API
  const fetchUserFolders = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/folders')
      if (response.ok) {
        const data = await response.json()
        setFolders(data.folders || [])
      } else {
        console.error("Error fetching folders: Status", response.status)
        toast.error("Could not load your folders")
      }
    } catch (error) {
      console.error("Error fetching folders:", error)
      toast.error("Could not load your folders")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create a new folder
  const createNewFolder = useCallback(async (newFolderName: string) => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name")
      return false
    }
    
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFolderName,
          parentId: selectedFolder
        }),
      })
      
      if (response.ok) {
        toast.success(`Folder "${newFolderName}" created`)
        await fetchUserFolders()
        return true
      } else {
        const errorData = await response.json()
        toast.error(`Failed to create folder: ${errorData.error || "Unknown error"}`)
        return false
      }
    } catch (error) {
      console.error("Error creating folder:", error)
      toast.error("Could not create folder")
      return false
    }
  }, [selectedFolder, fetchUserFolders])

  // Get folder name by ID
  const getFolderName = useCallback((folderId: string | undefined) => {
    if (!folderId) return "Root"
    const folder = folders.find(f => f.id === folderId)
    return folder ? folder.name : "Unknown Folder"
  }, [folders])

  // Load folders on initial render
  useEffect(() => {
    fetchUserFolders()
  }, [fetchUserFolders])

  return {
    folders,
    selectedFolder,
    isLoading,
    setSelectedFolder,
    fetchUserFolders,
    createNewFolder,
    getFolderName,
  }
}
