"use client"
import { useState, useEffect } from "react"
import {
  Headphones, FolderTree, Folder, FolderPlus, FileAudio, Film, FileQuestion, Search
} from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
// Import components
import { UploadCard } from "./dashboard/upload-card"
import { FileViewer } from "./dashboard/file-viewer"
import { NewFolderDialog, DeleteFileDialog } from "./dashboard/dialog-components"
import { AudioPlayerDialog } from "./audio-player-dialog"
import { SettingsDialog } from "./settings-dialog"
// Import hooks and types
import { useFolders } from "@/hooks/use-folders"
import { useFiles } from "@/hooks/use-files"
import { FileType } from "@/types"
// Import utilities
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { Avatar, AvatarFallback } from "./ui/avatar"

export function Dashboard({ initialFiles = [] }: { initialFiles: FileType[] }) {
  // State
  const [showSettings, setShowSettings] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [user, setUser] = useState<any>(null)
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)

  // Custom hooks
  const { 
    folders, 
    selectedFolder, 
    setSelectedFolder, 
    createNewFolder,
    getFolderName
  } = useFolders()

  const {
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
    handleFileUpload,
    handleFileSelection,
    handleSelectAllFiles,
    moveFilesToFolder,
    confirmDeleteFile,
    deleteSelectedFiles,
    formatFileSize,
    toggleSortOrder
  } = useFiles({ 
    initialFiles,
    selectedFolder,
    getFolderName 
  })

  // Hooks
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  
  // Create Supabase client once
  const [supabase] = useState(() => createBrowserSupabaseClient())
  
  // Initialize: fetch user data
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const getUserInitials = (email: string) => {
    return email?.substring(0, 2).toUpperCase() || "U"
  }
  
  // Handle creating a new folder and close dialog
  const handleCreateNewFolder = async () => {
    const success = await createNewFolder(newFolderName)
    if (success) {
      setNewFolderName("")
      setShowNewFolderDialog(false)
    }
  }

  // Handle deleting a file with confirmation
  const handleDeleteFileWithConfirm = (fileId: string) => {
    setFileToDelete(fileId)
    setConfirmDeleteDialogOpen(true)
  }

  const handleConfirmDeleteFile = async () => {
    if (!fileToDelete) return
    const success = await confirmDeleteFile(fileToDelete)
    if (success) {
      setConfirmDeleteDialogOpen(false)
      setFileToDelete(null)
    }
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
            <UploadCard 
              folders={folders}
              selectedFolder={selectedFolder}
              setSelectedFolder={setSelectedFolder}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              handleFileUpload={handleFileUpload}
            />
            {/* Files Section */}
            <FileViewer 
              files={files}
              filteredFiles={filteredFiles}
              selectedFiles={selectedFiles}
              selectedFolder={selectedFolder}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              toggleSortOrder={toggleSortOrder}
              filterType={filterType}
              setFilterType={setFilterType}
              handleFileSelection={handleFileSelection}
              handleSelectAllFiles={handleSelectAllFiles}
              moveFilesToFolder={moveFilesToFolder}
              deleteSelectedFiles={deleteSelectedFiles}
              formatFileSize={formatFileSize}
              setSelectedFile={setSelectedFile}
              handleDeleteFileWithConfirm={handleDeleteFileWithConfirm}
              getFolderName={getFolderName}
              onCreateFolder={() => setShowNewFolderDialog(true)}
              folders={folders}
              setSelectedFolder={setSelectedFolder}
            />
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
      <NewFolderDialog
        open={showNewFolderDialog}
        onOpenChange={setShowNewFolderDialog}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
        onCreateFolder={handleCreateNewFolder}
      />
      
      {/* Delete File Confirmation Dialog */}
      <DeleteFileDialog
        open={confirmDeleteDialogOpen}
        onOpenChange={(open) => {
          setConfirmDeleteDialogOpen(open)
          if (!open) setFileToDelete(null)
        }}
        onConfirmDelete={handleConfirmDeleteFile}
        isDeleting={isDeleting}
      />
    </div>
  )
}