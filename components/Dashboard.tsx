"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Youtube, Globe, Folder, MoreVertical, FileText, Image, Film, User, Loader2 } from "lucide-react"
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

export function Dashboard({ initialFiles }) {
  const [files, setFiles] = useState(initialFiles)
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [user, setUser] = useState(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [isUploading, setIsUploading] = useState(false)

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

  const onDrop = (acceptedFiles) => {
    setFiles((prevFiles) => [
      ...prevFiles,
      ...acceptedFiles.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: getFormattedDate(new Date()),
      })),
    ])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image")) return <Image className="h-5 w-5" />
    if (fileType.startsWith("video")) return <Film className="h-5 w-5" />
    return <FileText className="h-5 w-5" />
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const getSignedUrl = useCallback(async (file: File) => {
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get signed URL")
    }

    return response.json()
  }, [])

  const uploadToSignedUrl = useCallback(async (file: File, signedUrl: string) => {
    const response = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to upload file")
    }
  }, [])

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setIsUploading(true)

      try {
        const { signedUrl, filePath } = await getSignedUrl(file)
        await uploadToSignedUrl(file, signedUrl)

        toast.success("File uploaded successfully")

        // Refresh the file list
        const newFiles = await getFilesFromServer()
        setFiles(newFiles)
      } catch (error) {
        console.error("Error uploading file:", error)
        toast.error("Error uploading file")
      } finally {
        setIsUploading(false)
      }
    },
    [getSignedUrl, uploadToSignedUrl],
  )

  const getFilesFromServer = async () => {
    // Replace with your actual API call to fetch files
    return []
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
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span className="font-bold">Mi Página</span>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
            </div>
            <Input type="search" placeholder="Buscar..." className="w-[300px] md:w-[400px]" />
            <div className="flex items-center space-x-4">
              <Button>Upgrade</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8">
                    <span className="sr-only">Abrir menú de usuario</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <User className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user && <DropdownMenuItem className="font-semibold">{user.email}</DropdownMenuItem>}
                  <DropdownMenuItem onClick={() => setShowSettings(true)}>Configuración</DropdownMenuItem>
                  <DropdownMenuItem>Comunicarse con soporte</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Cerrar sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      <main className="container py-6 space-y-8 text-foreground">
        <div
          {...getRootProps()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-primary"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Suelta los archivos aquí...</p>
          ) : (
            <p>Arrastra y suelta archivos aquí, o haz clic para seleccionar archivos</p>
          )}
          <div className="mt-4 flex justify-center space-x-4">
            <Button size="sm" className="flex items-center">
              <Upload className="mr-2 h-4 w-4" />
              Subir archivo
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
        </div>
        <div className="flex justify-between items-center">
          <Button variant="outline" className="flex items-center">
            <Folder className="mr-2 h-4 w-4" />
            Añadir Carpeta
          </Button>
          <Input
            type="file"
            onChange={handleFileUpload}
            accept="audio/*,video/*"
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <Button
            variant="outline"
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
                Upload File
              </>
            )}
          </Button>
          <Button>Ask All</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del archivo</TableHead>
              <TableHead>Fecha de creación</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <button className="flex items-center hover:text-primary" onClick={() => setSelectedFile(file.name)}>
                    {getFileIcon(file.type)}
                    <span className="ml-2">{file.name}</span>
                  </button>
                </TableCell>
                <TableCell>{file.lastModified}</TableCell>
                <TableCell>Usuario Actual</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" className="mr-2">
                    Ask
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Descargar</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>

      <AudioPlayerDialog
        open={!!selectedFile}
        onOpenChange={(open) => !open && setSelectedFile(null)}
        fileName={selectedFile || ""}
      />

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  )
}

