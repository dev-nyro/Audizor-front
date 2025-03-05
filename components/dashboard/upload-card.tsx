"use client"
import { useState } from "react"
import { Upload, Youtube, Globe, Loader2, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FolderType } from "@/hooks/use-folders"

interface UploadCardProps {
  folders: FolderType[]
  selectedFolder: string | null
  setSelectedFolder: (folderId: string | null) => void
  isUploading: boolean
  uploadProgress: number
  getRootProps: any
  getInputProps: any
  isDragActive: boolean
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function UploadCard({
  folders,
  selectedFolder,
  setSelectedFolder,
  isUploading,
  uploadProgress,
  getRootProps,
  getInputProps,
  isDragActive,
  handleFileUpload
}: UploadCardProps) {
  return (
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
  )
}
