"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AudioWaveAnimationProps {
  isPlaying: boolean
  className?: string
  barCount?: number
}

export function AudioWaveAnimation({ 
  isPlaying, 
  className,
  barCount = 5 
}: AudioWaveAnimationProps) {
  const [heights, setHeights] = useState<number[]>([])
  const [durations, setDurations] = useState<number[]>([])
  
  // Generate random heights and animation durations on mount
  useEffect(() => {
    const newHeights = Array(barCount).fill(0).map(() => Math.random() * 60 + 20)
    const newDurations = Array(barCount).fill(0).map(() => Math.random() * 0.8 + 0.6)
    
    setHeights(newHeights)
    setDurations(newDurations)
  }, [barCount])
  
  return (
    <div className={cn(
      "flex items-center justify-center gap-[2px] transition-opacity duration-300",
      isPlaying ? "opacity-100" : "opacity-30",
      className
    )}>
      {heights.map((height, i) => (
        <div 
          key={i}
          className="bg-primary/80 rounded-full"
          style={{ 
            width: '2px',
            height: `${height}%`,
            animation: isPlaying ? `waveAnimation ${durations[i]}s infinite alternate` : 'none',
            animationDelay: `${i * (0.6 / barCount)}s`,
            transform: isPlaying ? 'scaleY(1)' : 'scaleY(0.6)',
            transition: 'transform 0.4s ease'
          }}
        />
      ))}
      
      <style jsx global>{`
        @keyframes waveAnimation {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
