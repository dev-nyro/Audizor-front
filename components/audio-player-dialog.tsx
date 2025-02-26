"use client"

import * as React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Play, Pause, Volume2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface AudioPlayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
}

export function AudioPlayerDialog({ open, onOpenChange, fileName }: AudioPlayerDialogProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [selectedFormat, setSelectedFormat] = React.useState("txt")
  const [volume, setVolume] = React.useState(75)

  const formats = [
    { label: "Texto (TXT)", value: "txt" },
    { label: "PDF", value: "pdf" },
    { label: "Word (DOCX)", value: "docx" },
  ]

  // Simulate progress
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[70%] h-[70vh] flex flex-col gap-4">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-4 bg-primary/5 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full hover:scale-105 transition-transform"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <div className="space-y-1">
                <h3 className="font-medium">{fileName}</h3>
                <div className="text-sm text-muted-foreground">
                  {Math.floor(progress / 60)}:{(progress % 60).toString().padStart(2, "0")} / 3:45
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
          <div className="relative w-full h-1 bg-primary/10 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
              laborum.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {formats.find((f) => f.value === selectedFormat)?.label}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {formats.map((format) => (
                <DropdownMenuItem key={format.value} onClick={() => setSelectedFormat(format.value)}>
                  <Check className={`mr-2 h-4 w-4 ${selectedFormat === format.value ? "opacity-100" : "opacity-0"}`} />
                  {format.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>Exportar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

