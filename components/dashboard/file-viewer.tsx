"use client"
import { useState } from "react"
import {
  Play, MoreVertical, FileText, Film, FileAudio, Search, 
  MessageSquare, Share2, Download, Trash2, Grid3X3, 
  LayoutList, FilterX, Filter, AlertCircle, Clock, 
  FolderPlus, FolderTree, FileQuestion, Headphones
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileType } from "@/hooks/use-files"
import { cn } from "@/lib/utils"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

interface FileViewerProps {
  files: FileType[]
  filteredFiles: FileType[]
  selectedFiles: string[]
  selectedFolder: string | null
  searchQuery: string
  setSearchQuery: (query: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
  sortOrder: 'asc' | 'desc'
  toggleSortOrder: () => void
  filterType: string
  setFilterType: (type: string) => void
  handleFileSelection: (fileId: string, selected: boolean) => void
  handleSelectAllFiles: (checked: boolean | "indeterminate") => void
  moveFilesToFolder: (folderId: string) => void
  deleteSelectedFiles: () => void
  formatFileSize: (size: number) => string
  setSelectedFile: (file: FileType | null) => void
  handleDeleteFileWithConfirm: (fileId: string) => void
  getFolderName: (folderId?: string | null) => string
  onCreateFolder: () => void
  folders: Array<{ id: string; name: string; [key: string]: any }>;
  setSelectedFolder: (folderId: string | null) => void
}

export function FileViewer({
  files,
  filteredFiles,
  selectedFiles,
  selectedFolder,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOrder,
  toggleSortOrder,
  filterType,
  setFilterType,
  handleFileSelection,
  handleSelectAllFiles,
  moveFilesToFolder,
  deleteSelectedFiles,
  formatFileSize,
  setSelectedFile,
  handleDeleteFileWithConfirm,
  getFolderName,
  onCreateFolder
}: FileViewerProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
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

  return (
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
          <Button variant="outline" onClick={onCreateFolder}>
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
                {/* Display folders here */}
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

      {/* File Display: Grid or List View */}
      {filteredFiles.length > 0 && (
        <>
          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="overflow-hidden hover:shadow-md transition-all">
                  <div 
                    className="aspect-video bg-muted flex items-center justify-center cursor-pointer relative"
                    onClick={() => setSelectedFile(file)}
                  >
                    {file.thumbnailUrl ? (
                      <img 
                        src={file.thumbnailUrl} 
                        alt={file.name} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <>
                        {getFileIcon(file.type)}
                        <div className="absolute top-2 right-2">
                          {getStatusIcon(file.status)}
                        </div>
                      </>
                    )}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                      <Button variant="secondary" size="icon" className="mr-2">
                        <Play className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <CardHeader className="p-3 pb-0">
                    <div className="flex justify-between items-start">
                      <div className="truncate">
                        <CardTitle className="text-sm truncate">{file.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {formatFileSize(file.size)} • {file.type.split('/')[1] || file.type}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedFile(file)}>
                            <Play className="mr-2 h-4 w-4" />
                            Play / View
                          </DropdownMenuItem>
                          {file.status === "completed" && (
                            <>
                              <DropdownMenuItem>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Chat with Transcript
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                Edit Transcript
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteFileWithConfirm(file.id || '')}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardFooter className="p-3 pt-0 flex justify-between items-center">
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedFiles.includes(file.id || '')}
                        onCheckedChange={(checked) => 
                          handleFileSelection(file.id || '', checked === true)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="mr-2"
                      />
                      <span className="text-xs text-muted-foreground truncate">
                        {new Date(file.lastModified).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge 
                      variant={
                        file.status === "completed" ? "default" : 
                        file.status === "processing" ? "secondary" : "destructive"
                      }
                      className="capitalize text-[10px]"
                    >
                      {file.status}
                    </Badge>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
      
          {/* List View */}
          {viewMode === "list" && (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px]">
                      <Checkbox 
                        checked={filteredFiles.length > 0 && selectedFiles.length === filteredFiles.length} 
                        onCheckedChange={handleSelectAllFiles}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Folder</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow 
                      key={file.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedFile(file)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selectedFiles.includes(file.id || '')} 
                          onCheckedChange={(checked) => 
                            handleFileSelection(file.id || '', checked === true)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <div className="truncate max-w-[200px]">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.type.split('/')[1] || file.type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            file.status === "completed" ? "default" : 
                            file.status === "processing" ? "secondary" : "destructive"
                          }
                          className="capitalize"
                        >
                          {file.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>{new Date(file.lastModified).toLocaleDateString()}</TableCell>
                      <TableCell>{getFolderName(file.folderId)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedFile(file)}>
                                <Play className="mr-2 h-4 w-4" />
                                Play / View
                              </DropdownMenuItem>
                              {file.status === "completed" && (
                                <>
                                  <DropdownMenuItem>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Chat with Transcript
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Edit Transcript
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteFileWithConfirm(file.id || '')}>
                                <Trash2 className="mr-2 h-4 w-4" />
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
          )}
        </>
      )}
    </div>
  )
}
