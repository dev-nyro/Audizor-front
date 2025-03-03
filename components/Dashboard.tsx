"use client"
import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useDropzone } from "react-dropzone"
import {
  Upload, Youtube, Globe, Folder, MoreVertical, FileText, Film,
  User, Loader2, Headphones, FileAudio, Search, Plus, FolderPlus,
  MessageSquare, Share2, Download, Trash2, Play, FolderTree, FileQuestion,
  Grid3X3, LayoutList, FilterX, Filter, AlertCircle, Clock
} from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AudioPlayerDialog } from "./audio-player-dialog"
import { SettingsDialog } from "./settings-dialog"
// Supabase client
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { uploadAndProcessFile } from "@/lib/upload-handler"
import { toast } from "sonner"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue
} from "./ui/select"
import { Alert, AlertDescription } from "./ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { cn } from "@/lib/utils"
interface FileType {
  id?: string;
  name: string;
  type: string;
  size: number;
  lastModified: string;
  url?: string;
  transcriptUrl?: string;
  status?: 'processed' | 'processing' | 'error';
  folderId?: string;
  thumbnailUrl?: string;
}
interface FolderType {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
  fileCount?: number;
}
export function DashboardFix({ initialFiles }: { initialFiles: FileType[] }) {
  // State
  const [files, setFiles] = useState<FileType[]>(initialFiles)
  const [folders, setFolders] = useState<FolderType[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"date" | "name" | "size" | "type">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [user, setUser] = useState<any>(null)
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [filterType, setFilterType] = useState<"all" | "audio" | "video" | "unprocessed">("all")
  // Hooks
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  // Create Supabase client ONCE with useState to avoid multiple instances warning
  const [supabase] = useState(() => createBrowserSupabaseClient())
  // Initialize: fetch user data and files
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) {
        console.error("Error fetching user:", error)
        router.push("/login")
        return
      }
      setUser(user)
      fetchUserFiles()
      fetchUserFolders()
    }
    getUser()
  }, [supabase, router])
  // Fetch user files from API
  const fetchUserFiles = async () => {
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
  }
  // Fetch user folders from API
  const fetchUserFolders = async () => {
    try {
      // Get folders from the API
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
    }
  }
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
          typeMatch = file.status !== "processed";
        }
        
        const result = folderMatch && searchMatch && typeMatch;
        console.log(`File ${file.name}: folder=${folderMatch} search=${searchMatch} type=${typeMatch} => ${result}`);
        return result;
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
  // Get folder name by ID
  const getFolderName = (folderId: string | undefined) => {
    if (!folderId) return "Root"
    const folder = folders.find(f => f.id === folderId)
    return folder ? folder.name : "Unknown Folder"
  }
  // File upload handler using our improved upload function
  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)
    const result = await uploadAndProcessFile(
      file,
      selectedFolder,
      (progress) => setUploadProgress(progress),
      (error) => toast.error(`Upload error: ${error.message}`)
    )
    if (result.success) {
      toast.success(`"${file.name}" uploaded successfully and is being processed`)
      fetchUserFiles()
    }
    setIsUploading(false)
    setUploadProgress(0)
  }
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
  }, [selectedFolder])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': [],
      'video/*': [],
    },
    maxSize: 100 * 1024 * 1024, // 100MB limit
  })
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return
      if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
        toast.error("Only audio and video files are supported")
        return
      }
      await uploadFile(file)
    },
    [uploadFile]
  )
  // Folder operations - using fixed endpoints
  const createNewFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name")
      return
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
        setNewFolderName("")
        setShowNewFolderDialog(false)
        fetchUserFolders()
      } else {
        const errorData = await response.json()
        toast.error(`Failed to create folder: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error creating folder:", error)
      toast.error("Could not create folder")
    }
  }
  // File operations
  const handleFileSelection = (fileId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedFiles(prev => [...prev, fileId])
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId))
    }
  }
  const handleSelectAllFiles = (selected: boolean) => {
    if (selected) {
      setSelectedFiles(filteredFiles.map(file => file.id || '').filter(Boolean))
    } else {
      setSelectedFiles([])
    }
  }
  const moveFilesToFolder = async (targetFolderId: string) => {
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
  }
  const handleDeleteFile = (fileId: string) => {
    setFileToDelete(fileId)
    setConfirmDeleteDialogOpen(true)
  }
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return
    setIsDeleting(true)
    try {
      const response = await fetch('/api/files', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileIds: [fileToDelete]
        }),
      })
      if (response.ok) {
        toast.success("File deleted successfully")
        fetchUserFiles()
        setConfirmDeleteDialogOpen(false)
        setFileToDelete(null)
      } else {
        const errorData = await response.json()
        toast.error(`Failed to delete file: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      toast.error("Could not delete file")
    } finally {
      setIsDeleting(false)
    }
  }
  const deleteSelectedFiles = async () => {
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
  }
  // UI Helpers
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("audio")) return <FileAudio className="h-5 w-5 text-blue-500" />
    if (fileType.startsWith("video")) return <Film className="h-5 w-5 text-purple-500" />
    return <FileText className="h-5 w-5" />
  }
  const getStatusIcon = (status?: string) => {
    if (status === 'processing') return <Clock className="h-5 w-5 text-yellow-500" />
    if (status === 'error') return <AlertCircle className="h-5 w-5 text-red-500" />
    return null
  }
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }
  const getUserInitials = (email: string) => {
    return email?.substring(0, 2).toUpperCase() || "U"
  }
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground">
        <div className="container flex h-14 items-center">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Headphones className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">Audizor</span>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
            </div>
            <div className="relative w-[300px] md:w-[400px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search files and transcripts..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">Upgrade Plan</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8">
                    <span className="sr-only">Open user menu</span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user ? getUserInitials(user.email) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user && <DropdownMenuItem className="font-semibold">{user.email}</DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowSettings(true)}>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Contact Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-border bg-muted/40 p-4 hidden md:block">
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setSelectedFolder(null)}
            >
              <FolderTree className="mr-2 h-4 w-4" />
              All Files
            </Button>
            <Separator />
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground py-1">
                Folders
              </div>
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-1">
                  {folders.map(folder => (
                    <Button
                      key={folder.id}
                      variant={selectedFolder === folder.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedFolder(folder.id)}
                    >
                      <Folder className="mr-2 h-4 w-4" />
                      <span className="truncate">{folder.name}</span>
                      {folder.fileCount && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {folder.fileCount}
                        </span>
                      )}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => setShowNewFolderDialog(true)}
                  >
                    <FolderPlus className="mr-2 h-4 w-4" />
                    New Folder
                  </Button>
                </div>
              </ScrollArea>
            </div>
            <Separator />
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground py-1">
                Filters
              </div>
              <Button
                variant={filterType === "all" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setFilterType("all")}
              >
                <FolderTree className="mr-2 h-4 w-4" />
                All Files
              </Button>
              <Button
                variant={filterType === "audio" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setFilterType("audio")}
              >
                <FileAudio className="mr-2 h-4 w-4 text-blue-500" />
                Audio Files
              </Button>
              <Button
                variant={filterType === "video" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setFilterType("video")}
              >
                <Film className="mr-2 h-4 w-4 text-purple-500" />
                Video Files
              </Button>
              <Button
                variant={filterType === "unprocessed" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setFilterType("unprocessed")}
              >
                <FileQuestion className="mr-2 h-4 w-4 text-amber-500" />
                Unprocessed
              </Button>
            </div>
          </div>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="container py-6 space-y-6">
            {/* Upload Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Upload Media for Transcription</CardTitle>
                <CardDescription>
                  Drag and drop files or use the upload button
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors 
                    ${isDragActive ? 'border-primary bg-primary/5' : 'hover:border-primary hover:bg-primary/5'}`}
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <div className="py-6">
                      <Headphones className="h-12 w-12 mx-auto text-primary mb-4" />
                      <p className="text-lg font-medium">Drop your audio or video files here</p>
                    </div>
                  ) : (
                    <div className="py-6">
                      <Upload className="h-12 w-12 mx-auto text-primary mb-4" />
                      <p className="text-lg font-medium">Drag and drop audio or video files here</p>
                      <p className="text-sm text-muted-foreground mt-2">or click to browse files</p>
                      <p className="text-xs text-muted-foreground mt-1">Supports MP3, WAV, MP4, and MOV up to 100MB</p>
                    </div>
                  )}
                </div>
                {isUploading && (
                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Uploading...</span>
                      <span className="text-sm font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  accept="audio/*,video/*"
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <Button
                  variant="default"
                  className="flex items-center"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Media
                    </>
                  )}
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Youtube className="mr-2 h-4 w-4" />
                  From YouTube
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  From URL
                </Button>
                <div className="ml-auto flex gap-2">
                  <Select
                    value={selectedFolder || "root"}
                    onValueChange={(value) => setSelectedFolder(value === "root" ? null : value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Upload to..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">Root Folder</SelectItem>
                      {folders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardFooter>
            </Card>
            {/* Files Section */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold mr-2">
                    {selectedFolder ? getFolderName(selectedFolder) : "All Files"}
                    {filterType !== "all" && (
                      <span className="ml-2 text-base font-normal text-muted-foreground">
                        ({
                          filterType === "audio" ? "Audio Only" :
                            filterType === "video" ? "Video Only" :
                              "Unprocessed Only"
                        })
                      </span>
                    )}
                  </h2>
                  <Badge variant="outline" className="font-normal">
                    {filteredFiles.length} files
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {/* View mode toggle */}
                  <div className="flex rounded-md border border-border overflow-hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "rounded-none border-0",
                        viewMode === "grid" ? "bg-accent" : ""
                      )}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "rounded-none border-0",
                        viewMode === "list" ? "bg-accent" : ""
                      )}
                      onClick={() => setViewMode("list")}
                    >
                      <LayoutList className="h-4 w-4" />
                    </Button>
                  </div>
                  {/* Sorting options */}
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleSortOrder}
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {sortOrder === 'asc' ? (
                      <Filter className="h-4 w-4" />
                    ) : (
                      <FilterX className="h-4 w-4" />
                    )}
                  </Button>
                  {/* Folder actions */}
                  <Button variant="outline" onClick={() => setShowNewFolderDialog(true)}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    New Folder
                  </Button>
                </div>
              </div>
              {/* Actions for selected files */}
              {selectedFiles.length > 0 && (
                <div className="mb-4 p-2 border rounded-md bg-muted/20 flex items-center">
                  <span className="ml-2 font-medium">
                    {selectedFiles.length} selected
                  </span>
                  <div className="ml-auto flex gap-2">
                    <Select
                      onValueChange={(value) => moveFilesToFolder(value === "root" ? "" : value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Move to folder..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="root">Root Folder</SelectItem>
                        {folders.map(folder => (
                          <SelectItem key={folder.id} value={folder.id}>
                            {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={deleteSelectedFiles}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
              {/* Empty state */}
              {filteredFiles.length === 0 && (
                <div className="text-center py-12 border rounded-lg border-dashed">
                  <Headphones className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No media files found</h3>
                  <p className="text-muted-foreground mb-4">
                    {files.length === 0
                      ? "Upload your first audio or video file to get started"
                      : "Try changing your filters or search query"}
                  </p>
                  <Button onClick={() => document.getElementById("file-upload")?.click()}>
                    Upload a file
                  </Button>
                </div>
              )}
              {/* Rest of the component is unchanged */}
            </div>
          </div>
        </div>
      </div>
      {/* Dialogs */}
      {selectedFile && (
        <AudioPlayerDialog
          open={!!selectedFile}
          onOpenChange={(open) => !open && setSelectedFile(null)}
          file={selectedFile}
        />
      )}
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Enter a name for your new folder
          </DialogDescription>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="mt-4"
          />
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createNewFolder}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete File Confirmation Dialog */}
      <Dialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Delete File</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this file? This action cannot be undone.
          </DialogDescription>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDeleteDialogOpen(false)
                setFileToDelete(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteFile}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}