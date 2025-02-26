"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { AuthBackground } from "@/components/auth-background"
import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { registerUser } from "../actions/auth"
import { toast } from "sonner"
import type React from "react" // Added import for React

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleGoogleRegister = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al registrarse con Google")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await registerUser(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      toast.success("Registro exitoso")
      router.push("/login")
    } catch (error) {
      setError("Error al registrar usuario")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/dashboard")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  return (
    <div className="min-h-screen flex flex-col">
      <AuthBackground />

      <Link href="/" className="fixed top-8 left-8 flex items-center space-x-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-white"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <span className="text-xl font-bold text-white">TranscribeAI</span>
      </Link>

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 text-white">Crear Cuenta</h1>
              <p className="text-gray-400">Comienza tu prueba gratuita hoy</p>
            </div>

            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full h-12 text-base font-medium bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={handleGoogleRegister}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Registrarse con Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-gray-400 bg-black/30">O regístrate con</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  name="nombre"
                  placeholder="Nombre completo"
                  required
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  required
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  required
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmar contraseña"
                  required
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base font-medium bg-white text-black hover:bg-white/90"
                >
                  {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>
              </form>

              <div className="text-center mt-6">
                <p className="text-gray-400">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/login" className="text-white hover:underline">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

