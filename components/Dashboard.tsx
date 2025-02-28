"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { 
  Upload, Youtube, Globe, Folder, MoreVertical, FileText, 
  Image, Film, User, Loader2, Music, Trash2, Download, 
  RefreshCw 
} from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AudioPlayerDialog } from "./audio-player-dialog"
import { SettingsDialog } from "./settings-dialog"
import { createBrowserClient } from "@supabase/ssr"
import { getFormattedDate } from "@/lib/date-utils"
import { toast } from "sonner"
import { uploadFile, formatFileSize, getFileIcon } from "@/lib/file-utils"
import { cn } from "@/lib/utils"

export function Dashboard({ initialFiles }) {
  const [files, setFiles] = useState(initialFiles)
  const [searchTerm, setSearchTerm] = useState("")
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [user, setUser] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

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
    }
    getUser()
  }, [supabase, router])

  const refreshFiles = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/files")
      if (!response.ok) throw new Error("Failed to fetch files")
      const data = await response.json()
      setFiles(data)
    } catch (error) {
      console.error("Error refreshing files:", error)
      toast.error("Could not refresh files")
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const uploadFiles = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return
    
    setIsUploading(true)
    try {
      for (const file of acceptedFiles) {
        if (file.size > 100 * 1024 * 1024) { // 100MB limit
          toast.error(`File ${file.name} exceeds 100MB limit`)
          continue
        }
        
        await toast.promise(
          uploadFile(file, user.id),
          {
            loading: `Uploading ${file.name}...`,
            success: `${file.name} uploaded successfully!`,
            error: `Failed to upload ${file.name}`,
          }
        )
      }
      
      await refreshFiles()
    } catch (error) {
      console.error("Error uploading files:", error)
    } finally {
      setIsUploading(false)
    }
  }, [user, refreshFiles])

  const onDrop = useCallback((acceptedFiles) => {
    uploadFiles(acceptedFiles)
  }, [uploadFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'audio/*': [],
      'video/*': []
    },
    disabled: isUploading
  })

  const handleFileUpload = useCallback((event) => {
    const files = event.target.files
    if (files?.length) {
      uploadFiles(Array.from(files))
    }
  }, [uploadFiles])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleDeleteFile = useCallback(async (fileId) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete file')
      
      toast.success('File deleted successfully')
      refreshFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
      toast.error('Failed to delete file')
    }
  }, [refreshFiles])

  const filteredFiles = searchTerm.trim() !== ""
    ? files.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : files

  const renderFileIcon = (fileType) => {
    switch(getFileIcon(fileType)) {
      case "image": return <Image className="h-5 w-5" />
      case "video": return <Film className="h-5 w-5" />
      case "audio": return <Music className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground">
        <div className="container flex h-14 items-center">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v12" />
                  <path d="M8 10h8" />
                </svg>
                <span className="font-bold">Audizor</span>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
            </div>
            <Input 
              type="search" 
              placeholder="Search files..." 
              className="w-[300px] md:w-[400px]" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex items-center space-x-4">
              <Button variant="outline">Upgrade</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8">
                    <span className="sr-only">User menu</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <User className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user && <DropdownMenuItem className="font-semibold">{user.email}</DropdownMenuItem>}
                  <DropdownMenuItem onClick={() => setShowSettings(true)}>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container py-6 space-y-6 text-foreground">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragActive 
              ? "border-primary bg-primary/5" 
              : "hover:border-primary",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-lg font-medium">Drop files here...</p>
          ) : (
            <>
              <p className="text-lg font-medium mb-2">Drag & drop audio or video files here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse your files</p>
            </>
          )}
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <input
              type="file"
              onChange={handleFileUpload}
              accept="audio/*,video/*"
              className="hidden"
              id="file-upload"
              disabled={isUploading}
              multiple
            />
            <Button 
              size="sm" 
              className="flex items-center"
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
            <Button size="sm" variant="outline" className="flex items-center">
              <Youtube className="mr-2 h-4 w-4" />
              YouTube
            </Button>
            <Button size="sm" variant="outline" className="flex items-center">
              <Globe className="mr-2 h-4 w-4" />
              URL
            </Button>
          </div>
          {isUploading && (
            <div className="mt-4 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Uploading...</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={refreshFiles}
              disabled={isRefreshing}
              className="flex items-center"
            >
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button variant="outline" className="flex items-center">
              <Folder className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          </div>
          <Button variant="default">Chat with all files</Button>
        </div>
        
        {files.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">File</TableHead>
                  <TableHead className="w-[20%]">Date</TableHead>
                  <TableHead className="w-[15%]">Size</TableHead>
                  <TableHead className="w-[15%]">Status</TableHead>
                  <TableHead className="w-[10%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file, index) => (
                  <TableRow key={file.id || index}>
                    <TableCell className="font-medium">
                      <button 
                        className="flex items-center hover:text-primary" 
                        onClick={() => setSelectedFile(file)}
                      >
                        {renderFileIcon(file.type)}
                        <span className="ml-2 truncate max-w-[250px]">{file.name}</span>
                      </button>
                    </TableCell>
                    <TableCell>{file.lastModified}</TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          file.transcriptionStatus === 'completed' ? "bg-green-500" :
                          file.transcriptionStatus === 'failed' ? "bg-red-500" :
                          "bg-yellow-500"
                        )} />
                        {file.transcriptionStatus === 'completed' ? "Transcribed" :
                         file.transcriptionStatus === 'failed' ? "Failed" :
                         "Processing"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setSelectedFile(file)}
                        >
                          Chat
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="flex items-center"
                              onClick={() => window.open(file.url, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center text-red-600"
                              onClick={() => handleDeleteFile(file.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-md">
            <p className="text-muted-foreground mb-4">No files found</p>
            <Button 
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={isUploading}
            >
              Upload your first file
            </Button>
          </div>
        )}
      </main>

      <AudioPlayerDialog
        open={!!selectedFile}
        onOpenChange={(open) => !open && setSelectedFile(null)}
        file={selectedFile}
      />

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  )
}

