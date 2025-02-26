"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false)
      } else {
        // Scrolling up
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", controlNavbar)

    return () => {
      window.removeEventListener("scroll", controlNavbar)
    }
  }, [lastScrollY])

  // Handle navigation with scroll reset
  const handleNavigation = (path: string) => {
    router.push(path)
    window.scrollTo({ top: 0 })
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[48rem] bg-[#F2F2F2]/80 backdrop-blur-xl rounded-full shadow-sm border border-[#BFBFBF]">
        <div className="w-full mx-auto px-2">
          <div className="h-12 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <button onClick={() => handleNavigation("/")} className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-[#0D0D0C]"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span className="font-medium text-sm text-[#0D0D0C]">Audizor</span>
              </button>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation("/about")}
                className="text-[#252626] hover:bg-[#BFBFBF]/20"
              >
                <span className="text-sm">Quiénes Somos</span>
              </Button>
              <DropdownMenu open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-[#252626] hover:bg-[#BFBFBF]/20">
                    Cómo Funciona
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#F2F2F2] border-[#BFBFBF]">
                  <DropdownMenuItem className="text-[#252626] hover:bg-[#BFBFBF]/20">Característica 1</DropdownMenuItem>
                  <DropdownMenuItem className="text-[#252626] hover:bg-[#BFBFBF]/20">Característica 2</DropdownMenuItem>
                  <DropdownMenuItem className="text-[#252626] hover:bg-[#BFBFBF]/20">Característica 3</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation("/pricing")}
                className="text-[#252626] hover:bg-[#BFBFBF]/20"
              >
                <span className="text-sm">Precios</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation("/register")}
                className="text-[#252626] hover:bg-[#BFBFBF]/20"
              >
                <span className="text-sm">Registro</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleNavigation("/login")}
                className="bg-[#252626] text-[#F2F2F2] hover:bg-[#0D0D0C]"
              >
                <span className="text-sm">Iniciar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

