"use client"

import { Navbar } from "@/components/Navbar"
import { useTheme } from "next-themes"
import { SlideUp } from "@/components/slide-up"
import { ScrollToTop } from "@/components/scroll-to-top"

export default function AboutPage() {
  const { theme } = useTheme()

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F2] text-[#252626]">
      <Navbar />
      <main className="flex-grow">
        <section className="relative min-h-screen flex items-center justify-center">
          <SlideUp>
            <div className="relative z-10 container mx-auto px-4 text-center space-y-8">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[#0D0D0C]">
                Revolucionando la Transcripción
              </h1>
              <p className="mx-auto max-w-[800px] text-xl md:text-2xl text-[#252626]">
                Descubre cómo estamos transformando la manera en que el mundo convierte voz a texto
              </p>
            </div>
          </SlideUp>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-12">
              <SlideUp>
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-[#0D0D0C]">Nuestra Historia</h2>
                  <p className="text-lg text-[#252626]">
                    Fundada en 2020 por un equipo de expertos en IA y procesamiento del lenguaje natural, Audizor nació
                    de la necesidad de hacer la transcripción más accesible y precisa para todos.
                  </p>
                </div>
              </SlideUp>

              <SlideUp delay={200}>
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-[#0D0D0C]">Nuestra Tecnología</h2>
                  <p className="text-lg text-[#252626]">
                    Utilizamos algoritmos de aprendizaje profundo de última generación para garantizar transcripciones
                    precisas en más de 30 idiomas. Nuestra plataforma no solo transcribe, sino que también identifica
                    hablantes y detecta emociones.
                  </p>
                </div>
              </SlideUp>

              <SlideUp delay={400}>
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-[#0D0D0C]">Nuestro Compromiso</h2>
                  <p className="text-lg text-[#252626]">
                    Nos comprometemos a proporcionar la mejor experiencia de transcripción posible, con un enfoque en la
                    precisión, la velocidad y la facilidad de uso.
                  </p>
                </div>
              </SlideUp>
            </div>
          </div>
        </section>
      </main>
      <ScrollToTop />
    </div>
  )
}

