"use client"

import { RefObject } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Copy, PauseCircle, PlayCircle, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { FileType, TranscriptSegment } from "./index"
import { Loader2 } from "lucide-react"

interface MediaPlayerProps {
  file: FileType
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isFullView: boolean
  audioRef: RefObject<HTMLAudioElement>
  transcript: TranscriptSegment[]
  rawTranscript: string
  isLoadingTranscript: boolean
  currentSegment: string | null
  onPlayPause: () => void
  onTimeUpdate: () => void
  onLoadedMetadata: () => void
  onVolumeChange: (value: number[]) => void
  onSeek: (value: number[]) => void
  onToggleMute: () => void
  onSkipForward: () => void
  onSkipBackward: () => void
  onSegmentClick: (segment: TranscriptSegment) => void
  onFullViewChange: (value: boolean) => void
}

export function MediaPlayer({
  file,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  audioRef,
  transcript,
  rawTranscript,
  isLoadingTranscript,
  currentSegment,
  onPlayPause,
  onTimeUpdate,
  onLoadedMetadata,
  onVolumeChange,
  onSeek,
  onToggleMute,
  onSkipForward,
  onSkipBackward,
  onSegmentClick
}: MediaPlayerProps) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }
  
  const copyTranscriptToClipboard = () => {
    if (rawTranscript) {
      navigator.clipboard.writeText(rawTranscript)
        .then(() => toast.success("Transcript copied to clipboard"))
        .catch(() => toast.error("Failed to copy transcript"))
    }
  }

  const VolumeIcon = isMuted ? VolumeX : volume > 0.5 ? Volume2 : Volume1

  return (
    <div className="flex flex-col bg-background relative h-full border-r">
      {/* Compact Audio Player */}
      <div className="p-4 border-b">
        <h3 className="font-medium mb-2 truncate">{file.name}</h3>
        
        {/* Audio element (hidden) */}
        <audio
          ref={audioRef}
          src={file.url}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={() => onPlayPause()}
          className="hidden"
        />
        
        {/* Timeline slider */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs w-10 text-right">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.01}
            onValueChange={onSeek}
            className="flex-grow"
          />
          <span className="text-xs w-10 text-left">{formatTime(duration)}</span>
        </div>
        
        {/* Minimalist Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onToggleMute} className="h-8 w-8 p-0">
              <VolumeIcon className="h-4 w-4" />
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={onVolumeChange}
              className="w-16 mx-2"
            />
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onSkipBackward} className="h-8 w-8 p-0">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onPlayPause}
              className="h-9 w-9 rounded-full p-0 flex justify-center items-center"
            >
              {isPlaying ? 
                <PauseCircle className="h-6 w-6" /> : 
                <PlayCircle className="h-6 w-6" />
              }
            </Button>
            <Button variant="ghost" size="sm" onClick={onSkipForward} className="h-8 w-8 p-0">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Transcript Section (Expanded to take more space) */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium">Transcript</h3>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 text-xs"
                onClick={copyTranscriptToClipboard}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            
            {isLoadingTranscript ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : transcript.length > 0 ? (
              /* Note: This section is kept for future implementation
                 as transcript segment matching is commented out */
              <div className="space-y-1.5">
                {transcript.map((segment) => (
                  <div 
                    key={segment.id}
                    className={cn(
                      "p-2 rounded-md cursor-pointer transition-colors text-sm",
                      segment.id === currentSegment 
                        ? "bg-primary/10 border-l-2 border-primary" 
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => onSegmentClick(segment)}
                  >
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(segment.start)}
                      </span>
                      {segment.speaker && (
                        <Badge variant="outline" className="text-xs h-5">
                          {segment.speaker}
                        </Badge>
                      )}
                    </div>
                    <p>{segment.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none text-sm">
                <p>{rawTranscript}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
