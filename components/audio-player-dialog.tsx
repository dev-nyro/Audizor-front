"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { 
  Loader2, SendIcon, PlayCircle, PauseCircle, SkipBack, SkipForward,
  Volume2, Volume1, VolumeX, Maximize2, Minimize2, ChevronRight,
  ChevronLeft, Sparkles, BookCopy, MessageSquare, Copy
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "./ui/card"
import { Badge } from "./ui/badge"
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

interface TranscriptSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

interface Message {
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
  const [activeTab, setActiveTab] = useState("transcript")
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([])
  const [rawTranscript, setRawTranscript] = useState("")
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false)
  const [currentSegment, setCurrentSegment] = useState<string | null>(null)
  const [highlightedSegment, setHighlightedSegment] = useState<string | null>(null)
  
  // Chat state
  const [userInput, setUserInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessingQuestion, setIsProcessingQuestion] = useState(false)
  const [chatContext, setChatContext] = useState<string[]>([])
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const transcriptRefs = useRef<{[key: string]: HTMLDivElement | null}>({})

  // Determine if we're dealing with audio or video
  const isAudio = file.type.startsWith("audio/")
  const mediaRef = isAudio ? audioRef : videoRef

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
      if (mediaRef.current) {
        mediaRef.current.pause()
      }
    }
  }, [open, file])

  useEffect(() => {
    // Scroll chat to bottom when new messages appear
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Scroll to current segment
  useEffect(() => {
    if (currentSegment && transcriptRefs.current[currentSegment]) {
      transcriptRefs.current[currentSegment]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [currentSegment])

  // Match current time to transcript segments
  useEffect(() => {
    if (!transcript.length) return
    
    const currentSegment = transcript.find(
      segment => currentTime >= segment.start && currentTime <= segment.end
    )
    
    if (currentSegment) {
      setCurrentSegment(currentSegment.id)
    }
  }, [currentTime, transcript])

  const fetchTranscript = async () => {
    if (!file.transcriptUrl) {
      setRawTranscript("Transcript not available yet. Processing may take a few minutes.")
      return
    }
    
    setIsLoadingTranscript(true)
    try {
      // This would be the actual API call to fetch transcript
      const response = await fetch(`/api/transcript/${file.transcriptUrl}`)
      if (response.ok) {
        const data = await response.json()
        if (data.segments) {
          setTranscript(data.segments)
          // Also create a raw text version for the chat context
          const rawText = data.segments.map((s: TranscriptSegment) => s.text).join(' ')
          setRawTranscript(rawText)
          setChatContext([rawText])
        } else {
          setRawTranscript(data.transcript || "No transcript available")
          setChatContext([data.transcript || ""])
        }
      } else {
        setRawTranscript("Failed to load transcript")
      }
    } catch (error) {
      console.error("Error fetching transcript:", error)
      setRawTranscript("Error loading transcript")
    } finally {
      setIsLoadingTranscript(false)
    }
  }

  const handlePlayPause = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause()
      } else {
        mediaRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume
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
    if (mediaRef.current) {
      mediaRef.current.currentTime = newTime
    }
  }

  const toggleMute = () => {
    if (mediaRef.current) {
      if (isMuted) {
        mediaRef.current.volume = volume
        setIsMuted(false)
      } else {
        mediaRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const handleSkipForward = () => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = Math.min(mediaRef.current.duration, currentTime + 10)
    }
  }

  const handleSkipBackward = () => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = Math.max(0, currentTime - 10)
    }
  }

  const handleSegmentClick = (segment: TranscriptSegment) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = segment.start
      if (!isPlaying) {
        mediaRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userInput.trim()) return
    
    const newMessage: Message = {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    setUserInput("")
    setIsProcessingQuestion(true)
    
    try {
      // Make API call to ask question about transcript
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userInput,
          fileId: file.transcriptUrl,
          context: chatContext,
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.answer,
          timestamp: new Date()
        }
        
        setMessages(prevMessages => [...prevMessages, assistantMessage])
      } else {
        toast.error("Failed to get an answer")
        
        const errorMessage: Message = {
          role: 'assistant',
          content: "I'm sorry, I couldn't process your question. Please try again.",
          timestamp: new Date()
        }
        
        setMessages(prevMessages => [...prevMessages, errorMessage])
      }
    } catch (error) {
      console.error("Error asking question:", error)
      toast.error("Error processing your question")
      
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, there was an error processing your question.",
        timestamp: new Date()
      }
      
      setMessages(prevMessages => [...prevMessages, errorMessage])
    } finally {
      setIsProcessingQuestion(false)
    }
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
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      modal={false}
    >
      <DialogContent 
        className={cn(
          "p-0 gap-0 rounded-lg overflow-hidden",
          isFullView 
            ? "max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh]" 
            : "max-w-5xl w-[90vw] max-h-[85vh]"
        )}
      >
        <div className={cn(
          "grid h-full",
          showTranscriptPanel
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1"
        )}>
          {/* Media Player Section */}
          <div className="flex flex-col bg-black text-white relative h-full">
            <div className="flex-grow flex items-center justify-center">
              {isAudio ? (
                <>
                  <div className="w-full max-w-md aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <PlayCircle className={`h-24 w-24 ${isPlaying ? 'opacity-0' : 'opacity-100'} transition-opacity`} />
                      <h3 className="mt-4 font-medium text-lg truncate px-4">{file.name}</h3>
                    </div>
                  </div>
                  <audio
                    ref={audioRef}
                    src={file.url}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                </>
              ) : (
                <video
                  ref={videoRef}
                  src={file.url}
                  className="max-h-full max-w-full"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                />
              )}
            </div>
            
            <div className="absolute top-2 right-2 flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white bg-black/50 hover:bg-black/70"
                onClick={() => setShowTranscriptPanel(prev => !prev)}
              >
                {showTranscriptPanel ? <ChevronRight /> : <ChevronLeft />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white bg-black/50 hover:bg-black/70"
                onClick={() => setIsFullView(prev => !prev)}
              >
                {isFullView ? <Minimize2 /> : <Maximize2 />}
              </Button>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Timeline slider */}
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.01}
                onValueChange={handleSeek}
                className="mb-2"
              />
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">{formatTime(currentTime)}</span>
                <span className="text-xs">{formatTime(duration)}</span>
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white">
                    <VolumeIcon className="h-5 w-5" />
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={handleSkipBackward} className="text-white">
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handlePlayPause} className="text-white">
                    {isPlaying ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleSkipForward} className="text-white">
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Transcript and Chat Section */}
          {showTranscriptPanel && (
            <div className="flex flex-col bg-background border-l h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="border-b px-4">
                  <TabsList className="my-2">
                    <TabsTrigger value="transcript" className="flex gap-2">
                      <BookCopy className="h-4 w-4" />
                      Transcript
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="flex gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Ask AI
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="transcript" className="flex-1 flex flex-col px-4 pt-4 overflow-hidden">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-lg">Transcript</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center"
                      onClick={copyTranscriptToClipboard}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy
                    </Button>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    {isLoadingTranscript ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : transcript.length > 0 ? (
                      <div className="space-y-2 py-2">
                        {transcript.map((segment) => (
                          <div 
                            key={segment.id}
                            ref={el => transcriptRefs.current[segment.id] = el}
                            className={cn(
                              "p-2 rounded-md cursor-pointer hover:bg-muted transition-colors",
                              segment.id === currentSegment ? "bg-primary/10 border-l-4 border-primary" : ""
                            )}
                            onClick={() => handleSegmentClick(segment)}
                            onMouseEnter={() => setHighlightedSegment(segment.id)}
                            onMouseLeave={() => setHighlightedSegment(null)}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(segment.start)} - {formatTime(segment.end)}
                              </span>
                              {segment.speaker && (
                                <Badge variant="outline" className="text-xs">
                                  {segment.speaker}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">{segment.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert max-w-none">
                        <p>{rawTranscript}</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="chat" className="flex-1 flex flex-col px-4 pt-4 overflow-hidden">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="py-3">
                      <CardTitle className="text-lg flex items-center">
                        <Sparkles className="h-5 w-5 text-primary mr-2" />
                        Chat with AI about this media
                      </CardTitle>
                      <CardDescription>
                        Ask questions about the content of this file
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 overflow-hidden">
                      <ScrollArea className="h-full pr-4" ref={chatContainerRef}>
                        <div className="space-y-4">
                          {messages.map((message, index) => (
                            <div 
                              key={index} 
                              className={cn(
                                "flex",
                                message.role === "user" ? "justify-end" : "justify-start",
                                message.role === "system" ? "justify-center" : ""
                              )}
                            >
                              <div 
                                className={cn(
                                  "rounded-lg p-3 max-w-[80%]",
                                  message.role === "user" ? 
                                    "bg-primary text-primary-foreground" : 
                                    message.role === "system" ?
                                      "bg-muted text-muted-foreground text-sm" :
                                      "bg-muted"
                                )}
                              >
                                <p className="whitespace-pre-wrap">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                          
                          {isProcessingQuestion && (
                            <div className="flex justify-start">
                              <div className="rounded-lg p-3 bg-muted">
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <p>Thinking...</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                    
                    <CardFooter className="pt-0">
                      <form onSubmit={handleSubmitQuestion} className="flex w-full gap-2">
                        <Input
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Ask a question about this media..."
                          className="flex-1"
                          disabled={isProcessingQuestion}
                        />
                        <Button type="submit" disabled={isProcessingQuestion || !userInput.trim()}>
                          {isProcessingQuestion ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <SendIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </form>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}