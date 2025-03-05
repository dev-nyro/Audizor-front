"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Card, CardContent, CardFooter
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, Loader2, MessageSquare, SendIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { FileType, Message, TranscriptSegment } from "./index"

interface ContentPanelProps {
  file: FileType
  transcript: TranscriptSegment[]
  rawTranscript: string
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  chatContext: string[]
  onHidePanel: () => void
}

export function ContentPanel({
  file, 
  transcript,
  rawTranscript,
  messages, 
  setMessages,
  chatContext,
  onHidePanel
}: ContentPanelProps) {
  // Chat state
  const [userInput, setUserInput] = useState("")
  const [isProcessingQuestion, setIsProcessingQuestion] = useState(false)
  
  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll chat to bottom when new messages appear
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

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

  return (
    <div className="flex flex-col bg-background h-full relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 z-10"
        onClick={onHidePanel}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    
      <Tabs value="chat" className="h-full flex flex-col">
        <TabsList className="mx-4 my-3 w-[calc(100%-2rem)]">
          <TabsTrigger value="chat" className="flex gap-2 flex-1">
            <MessageSquare className="h-4 w-4" />
            Ask AI about this audio
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col px-4 pb-4 overflow-hidden">
          <Card className="h-full flex flex-col border-0 shadow-none">
            <CardContent className="flex-1 overflow-hidden pt-2">
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
                  placeholder="Ask a question about this audio..."
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
  );
}
