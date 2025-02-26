"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Palette } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { themes } from "@/lib/themes"
import { cn } from "@/lib/utils"
import { useTheme as useCustomTheme } from "./theme-provider"

export function ThemeSelector() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { theme: mode, setTheme: setMode } = useTheme()
  const { theme, setTheme } = useCustomTheme()

  // Only show in dashboard
  if (pathname !== "/dashboard") {
    return null
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as any)
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-2">
            {themes.map((t) => (
              <button
                key={t.name}
                onClick={() => handleThemeChange(t.name)}
                className={cn(
                  "w-8 h-8 rounded-full transition-transform hover:scale-110",
                  "border-2 border-white dark:border-gray-800 shadow-lg",
                  theme === t.name && "ring-2 ring-offset-2 ring-primary",
                  "bg-gradient-to-br",
                )}
                style={{
                  backgroundImage: `linear-gradient(135deg, ${t.light.primary}, ${t.dark.primary})`,
                }}
                aria-label={`Tema ${t.name}`}
              />
            ))}
          </div>
        )}
        <Button
          size="icon"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-10 h-10 shadow-lg"
        >
          <Palette className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

