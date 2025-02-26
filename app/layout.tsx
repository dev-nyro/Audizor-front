import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeSelector } from "@/components/theme-selector"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children, params }) {
  // Only apply theme provider to dashboard
  const isDashboard = params?.segment === "dashboard"

  if (isDashboard) {
    return (
      <html lang="es" suppressHydrationWarning>
        <body className={cn(inter.className, "min-h-screen bg-background text-foreground")}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <ThemeSelector />
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    )
  }

  return (
    <html lang="es">
      <body className={cn(inter.className, "min-h-screen bg-[#E4F2E7] text-[#2D3E40]")}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
