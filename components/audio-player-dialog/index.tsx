"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MediaPlayer } from "./media-player"
import { ContentPanel } from "./content-panel"

// Types
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

export interface TranscriptSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface AudioPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: FileType;
}

export function AudioPlayerDialog({ open, onOpenChange, file }: AudioPlayerDialogProps) {
  // Player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullView, setIsFullView] = useState(false)
  const [showTranscriptPanel, setShowTranscriptPanel] = useState(true)
  
  // Content state
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([])
  const [rawTranscript, setRawTranscript] = useState("")
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false)
  const [currentSegment, setCurrentSegment] = useState<string | null>(null)
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [chatContext, setChatContext] = useState<string[]>([])
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (open && file) {
      fetchTranscript()
      
      // Add system message about the file
      if (messages.length === 0) {
        setMessages([
          {
            role: 'system',
            content: `I can answer questions about "${file.name}". What would you like to know?`,
            timestamp: new Date()
          }
        ])
      }
    }
    
    return () => {
      // Cleanup: pause media when dialog closes
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [open, file])

  // Match current time to transcript segments
  // COMMENTED OUT: Audio-transcript segment matching functionality
  /*
  useEffect(() => {
    if (!transcript.length) return
    
    const currentSegment = transcript.find(
      segment => currentTime >= segment.start && currentTime <= segment.end
    )
    
    if (currentSegment) {
      setCurrentSegment(currentSegment.id)
    }
  }, [currentTime, transcript])
  */

  const fetchTranscript = async () => {
    setIsLoadingTranscript(true)
    try {
      if (!file.id) {
        setRawTranscript("Transcript not available: No file ID found.")
        return
      }
      
      // Fetch transcript from the API based on the database structure
      const response = await fetch(`/api/transcript/${file.id}`)
      
      if (response.ok) {
        const data = await response.json()
        
        // If we have a transcription record from the database
        if (data.texto_transcripcion) {
          // Set raw transcript from the database field
          setRawTranscript(data.texto_transcripcion)
          setChatContext([data.texto_transcripcion])
          
          // For now, we're not parsing transcript segments
          // but keeping the state for future implementation
          setTranscript([])
        } else if (data.text) {
          // Fallback to text field if available
          setRawTranscript(data.text)
          setChatContext([data.text])
          setTranscript([])
        } else {
          // If we just got an unexpected data format
          const text = typeof data === 'string' ? data : JSON.stringify(data)
          setRawTranscript(text)
          setChatContext([text])
          setTranscript([])
        }
      } else {
        setRawTranscript("Failed to load transcript: " + (response.statusText || "Unknown error"))
      }
    } catch (error) {
      console.error("Error fetching transcript:", error)
      setRawTranscript("Error loading transcript. Please try again later.")
    } finally {
      setIsLoadingTranscript(false)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    
    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  const handleSeek = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.duration, currentTime + 10)
    }
  }

  const handleSkipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10)
    }
  }

  const handleSegmentClick = (segment: TranscriptSegment) => {
    if (audioRef.current) {
      audioRef.current.currentTime = segment.start
      if (!isPlaying) {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      modal={false}
    >
      <DialogContent 
        className={cn(
          "backdrop-blur-lg",
          "p-0 gap-0 rounded-lg overflow-hidden backdrop-blur-md bg-background/76",
          isFullView 
            ? "max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh]" 
            : "max-w-[80vw] w-[80vw] max-h-[80vh] h-[80vh]" // Set fixed height to maintain consistent size
        )}
        // Remove closeButton prop to disable the default close button
        closeButton={false}
      >
        <div className={cn(
          "grid h-full",
          showTranscriptPanel
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1"
        )}>
          <MediaPlayer 
            file={file}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            isMuted={isMuted}
            isFullView={isFullView}
            audioRef={audioRef}
            transcript={transcript}
            rawTranscript={rawTranscript}
            isLoadingTranscript={isLoadingTranscript}
            currentSegment={currentSegment}
            onPlayPause={handlePlayPause}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onVolumeChange={handleVolumeChange}
            onSeek={handleSeek}
            onToggleMute={toggleMute}
            onSkipForward={handleSkipForward}
            onSkipBackward={handleSkipBackward}
            onSegmentClick={handleSegmentClick}
            onFullViewChange={setIsFullView}
          />
          
          {/* Chat Section */}
          {showTranscriptPanel && (
            <ContentPanel 
              file={file}
              transcript={transcript}
              rawTranscript={rawTranscript}
              messages={messages}
              setMessages={setMessages}
              chatContext={chatContext}
              onHidePanel={() => setShowTranscriptPanel(false)}
            />
          )}
          
          {/* Button to show transcript panel when hidden */}
          {!showTranscriptPanel && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 bg-background/80 hover:bg-background"
              onClick={() => setShowTranscriptPanel(true)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
