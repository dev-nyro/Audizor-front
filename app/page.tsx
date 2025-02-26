"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { SlideUp } from "@/components/slide-up"
import { ScrollToTop } from "@/components/scroll-to-top"

const reasons = [
  {
    title: "Precisión Inigualable",
    description:
      "Nuestra IA avanzada garantiza transcripciones precisas en múltiples idiomas con una tasa de precisión superior al 99%.",
  },
  {
    title: "Rápido y Eficiente",
    description:
      "Obtén tus transcripciones en minutos, no en horas. Procesamos archivos hasta 5 veces más rápido que la competencia.",
  },
  {
    title: "Fácil de Usar",
    description:
      "Interfaz intuitiva que hace que la transcripción sea simple para todos. Sin necesidad de entrenamiento o configuración compleja.",
  },
  {
    title: "Seguridad Garantizada",
    description:
      "Tus archivos están seguros con nuestra encriptación de nivel empresarial y políticas estrictas de privacidad.",
  },
]

const features = [
  {
    title: "Transcripción en Tiempo Real",
    description:
      "Observa cómo tu audio se convierte en texto al instante, con actualizaciones en vivo mientras procesa.",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    title: "Editor Avanzado",
    description: "Edita y formatea tus transcripciones con nuestro editor intuitivo y herramientas de corrección.",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    title: "Subtítulos Automáticos",
    description: "Genera subtítulos perfectamente sincronizados para tus videos con un solo clic.",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    title: "Análisis de Sentimientos",
    description: "Detecta automáticamente el tono y las emociones en las conversaciones transcritas.",
    image: "/placeholder.svg?height=300&width=400",
  },
]

const howItWorks = [
  {
    icon: "📁",
    title: "Sube tu archivo",
    description: "Carga tu archivo de audio o video en nuestra plataforma segura.",
  },
  {
    icon: "🤖",
    title: "IA en acción",
    description: "Nuestra IA avanzada transcribe tu contenido con alta precisión.",
  },
  {
    icon: "✏️",
    title: "Edita y exporta",
    description: "Revisa, edita y exporta tu transcripción en múltiples formatos.",
  },
]

const testimonials = [
  {
    name: "María González",
    role: "Periodista",
    content: "Audizor ha revolucionado mi forma de trabajar. Las entrevistas ahora son mucho más fáciles de procesar.",
  },
  {
    name: "Carlos Ruiz",
    role: "Productor de Podcasts",
    content: "La precisión y velocidad son increíbles. He ahorrado horas de trabajo en cada episodio.",
  },
  {
    name: "Ana Martínez",
    role: "Investigadora",
    content:
      "La capacidad multilingüe ha sido fundamental para mis investigaciones internacionales. Un servicio excepcional.",
  },
  {
    name: "Luis Rodríguez",
    role: "Estudiante de Posgrado",
    content: "Audizor me ha ayudado enormemente con mis estudios. Transcribir conferencias nunca había sido tan fácil.",
  },
]

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col bg-[#F2F2F2] text-[#252626]">
      <Navbar />

      {/* Hero Section */}
      <section className="min-h-screen pt-20 flex items-center justify-center bg-[#F2F2F2]">
        <SlideUp className="container mx-auto px-4 text-center space-y-8">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-[#0D0D0C]">
            Transcripción Inteligente con Audizor
          </h1>
          <p className="mx-auto max-w-[800px] text-xl md:text-2xl text-[#252626]">
            Convierte audio y video en texto con precisión utilizando nuestra avanzada tecnología de IA.
          </p>
          <Button size="lg" className="text-lg px-8 py-6 bg-[#252626] text-[#F2F2F2] hover:bg-[#0D0D0C]">
            Comienza a Transcribir Gratis
          </Button>
        </SlideUp>
      </section>

      {/* Discover Our App Section */}
      <section className="py-24 bg-[#F2F2F2]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[#0D0D0C]">Descubre Audizor</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#BFBFBF] h-64 rounded-lg">
              {/* Placeholder for image */}
              <div className="w-full h-full flex items-center justify-center text-[#252626]">Imagen 1</div>
            </div>
            <div className="bg-[#BFBFBF] h-64 rounded-lg">
              {/* Placeholder for image */}
              <div className="w-full h-full flex items-center justify-center text-[#252626]">Imagen 2</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Use Our App Section */}
      <section className="py-24 bg-[#F2F2F2]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[#0D0D0C]">¿Por qué usar Audizor?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {reasons.map((reason, index) => (
              <SlideUp key={index} delay={index * 100}>
                <div className="p-6 bg-[#F2F2F2] rounded-lg shadow-lg border border-[#BFBFBF]">
                  <h3 className="text-xl font-semibold mb-4 text-[#0D0D0C]">{reason.title}</h3>
                  <p className="text-[#252626]">{reason.description}</p>
                </div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#F2F2F2]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[#0D0D0C]">
            Características Principales
          </h2>
          <div className="space-y-24">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex flex-col md:flex-row items-center gap-12 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-bold text-[#0D0D0C]">{feature.title}</h3>
                  <p className="text-lg text-[#252626]">{feature.description}</p>
                </div>
                <div className="flex-1">
                  <img
                    src={feature.image || "/placeholder.svg"}
                    alt={feature.title}
                    className="rounded-lg shadow-lg border border-[#BFBFBF]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-[#F2F2F2]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[#0D0D0C]">Cómo Funciona</h2>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center max-w-xs">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-[#0D0D0C]">{step.title}</h3>
                <p className="text-[#252626]">{step.description}</p>
                {index < howItWorks.length - 1 && (
                  <ArrowRight className="hidden md:block mt-4 text-[#BFBFBF]" size={24} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-[#F2F2F2]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[#0D0D0C]">
            Lo que dicen nuestros clientes
          </h2>
          <div className="relative overflow-hidden h-64">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`absolute top-0 left-0 w-full transition-all duration-500 ease-in-out ${
                  index === currentTestimonial ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
                }`}
              >
                <div className="bg-[#F2F2F2] rounded-lg p-6 shadow-lg border border-[#BFBFBF] max-w-2xl mx-auto">
                  <p className="text-lg mb-4 text-[#252626]">&ldquo;{testimonial.content}&rdquo;</p>
                  <div className="font-semibold text-[#0D0D0C]">{testimonial.name}</div>
                  <div className="text-[#A6A6A6]">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 bg-[#F2F2F2] border-t border-[#BFBFBF]">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#A6A6A6]">&copy; 2023 Audizor. Todos los derechos reservados.</p>
          <div className="mt-4 space-x-4">
            <a href="#" className="text-[#252626] hover:text-[#0D0D0C]">
              Términos de Servicio
            </a>
            <a href="#" className="text-[#252626] hover:text-[#0D0D0C]">
              Política de Privacidad
            </a>
            <a href="#" className="text-[#252626] hover:text-[#0D0D0C]">
              Contacto
            </a>
          </div>
        </div>
      </footer>

      <ScrollToTop />
    </div>
  )
}

