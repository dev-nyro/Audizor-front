"use client"

import { useRef } from "react"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Check, X } from "lucide-react"
import { ScrollToTop } from "@/components/scroll-to-top"
import { SlideUp } from "@/components/slide-up"
import type React from "react"

export default function PricingPage() {
  const { theme } = useTheme()
  const plansRef = useRef<HTMLDivElement>(null)
  const benefitsRef = useRef<HTMLDivElement>(null)

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const navbarHeight = 80 // Altura aproximada de la navbar + espacio extra
      const elementPosition = ref.current.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - window.innerHeight / 2 + ref.current.offsetHeight / 2

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  const plans = [
    {
      name: "Básico",
      price: "9.99",
      description: "Perfecto para comenzar con transcripciones básicas",
      features: [
        "5 horas de transcripción al mes",
        "Transcripción en 10 idiomas",
        "Exportación en formatos TXT y SRT",
        "Soporte por email",
      ],
    },
    {
      name: "Pro",
      price: "29.99",
      popular: true,
      description: "Ideal para profesionales y equipos pequeños",
      features: [
        "20 horas de transcripción al mes",
        "Transcripción en 30 idiomas",
        "Identificación de hablantes",
        "Exportación en todos los formatos",
        "Soporte prioritario",
      ],
    },
    {
      name: "Empresa",
      price: "Personalizado",
      description: "Solución personalizada para grandes organizaciones",
      features: [
        "Horas ilimitadas de transcripción",
        "Transcripción en todos los idiomas",
        "API de integración",
        "Características personalizadas",
        "Soporte 24/7",
      ],
    },
  ]

  const comparisonFeatures = [
    {
      feature: "Horas de transcripción",
      basic: "5 horas/mes",
      pro: "20 horas/mes",
      enterprise: "Ilimitado",
    },
    {
      feature: "Idiomas soportados",
      basic: "10 idiomas",
      pro: "30 idiomas",
      enterprise: "Todos los idiomas",
    },
    {
      feature: "Identificación de hablantes",
      basic: false,
      pro: true,
      enterprise: true,
    },
    {
      feature: "Exportación en formatos",
      basic: "TXT, SRT",
      pro: "Todos los formatos",
      enterprise: "Todos los formatos + Personalizado",
    },
    {
      feature: "Soporte técnico",
      basic: "Email",
      pro: "Prioritario",
      enterprise: "24/7 Dedicado",
    },
    {
      feature: "Integraciones API",
      basic: false,
      pro: false,
      enterprise: true,
    },
  ]

  return (
    <div className="flex flex-col bg-[#F2F2F2] text-[#252626]">
      <Navbar />
      <section className="relative min-h-screen flex items-center justify-center bg-[#F2F2F2]">
        <SlideUp>
          <div className="relative z-10 container mx-auto px-4 text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[#0D0D0C]">
              Planes Flexibles para Cada Necesidad
            </h1>
            <p className="mx-auto max-w-[800px] text-xl md:text-2xl text-[#252626]">
              Elige el plan perfecto para tus necesidades de transcripción
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => scrollTo(plansRef)}
                className="text-lg bg-[#252626] hover:bg-[#0D0D0C] text-[#F2F2F2]"
              >
                Ver Planes
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo(benefitsRef)}
                className="text-lg border-[#BFBFBF] text-[#252626] hover:bg-[#BFBFBF]/10"
              >
                Explorar Beneficios
              </Button>
            </div>
          </div>
        </SlideUp>
      </section>

      <section ref={plansRef} className="py-24 bg-[#F2F2F2]">
        <SlideUp>
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative border rounded-xl p-8 transition-transform duration-300 hover:scale-105 ${
                    plan.popular
                      ? "border-[#252626] bg-[#F2F2F2] text-[#252626]"
                      : "border-[#BFBFBF] bg-[#F2F2F2] text-[#252626]"
                  } ${plan.popular ? "ring-2 ring-[#252626]" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#252626] text-[#F2F2F2] px-4 py-1 rounded-full text-sm font-medium">
                        Más Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h2 className={`text-2xl font-bold mb-4 text-[#0D0D0C]`}>{plan.name}</h2>
                    <p className={`text-sm mb-4 text-[#A6A6A6]`}>{plan.description}</p>
                    <p className={`text-4xl font-bold mb-6 text-[#0D0D0C]`}>
                      {plan.price === "Personalizado" ? (
                        "Personalizado"
                      ) : (
                        <>
                          <span className="text-2xl">$</span>
                          {plan.price}
                          <span className={`text-lg text-[#A6A6A6]`}>/mes</span>
                        </>
                      )}
                    </p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="w-5 h-5 mr-2 text-green-500" />
                        <span className="text-[#252626]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-[#252626] text-[#F2F2F2] hover:bg-[#0D0D0C]"
                        : "bg-[#F2F2F2] hover:bg-[#BFBFBF] text-[#252626] border border-[#BFBFBF]"
                    }`}
                  >
                    {plan.name === "Empresa" ? "Contactar Ventas" : "Comenzar Ahora"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </SlideUp>
      </section>

      <section ref={benefitsRef} className="py-24 bg-[#F2F2F2]">
        <SlideUp>
          <div className="container mx-auto px-4">
            <h2 className={`text-3xl font-bold text-center mb-12 text-[#0D0D0C]`}>Comparación de Planes</h2>
            <div className="max-w-7xl mx-auto overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-[#BFBFBF]">
                    <th className={`py-4 px-6 text-left text-[#A6A6A6]`}>Característica</th>
                    <th className={`py-4 px-6 text-left text-[#A6A6A6]`}>Básico</th>
                    <th className={`py-4 px-6 text-left text-[#A6A6A6]`}>Pro</th>
                    <th className={`py-4 px-6 text-left text-[#A6A6A6]`}>Empresa</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((item, index) => (
                    <tr
                      key={item.feature}
                      className={`${"border-[#BFBFBF] hover:bg-[#BFBFBF]/10"} ${index !== comparisonFeatures.length - 1 ? "border-b" : ""}`}
                    >
                      <td className={`py-4 px-6 text-[#0D0D0C]`}>{item.feature}</td>
                      <td className="py-4 px-6">
                        {typeof item.basic === "boolean" ? (
                          item.basic ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <X className="w-5 h-5 text-red-500" />
                          )
                        ) : (
                          <span className="text-[#252626]">{item.basic}</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {typeof item.pro === "boolean" ? (
                          item.pro ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <X className="w-5 h-5 text-red-500" />
                          )
                        ) : (
                          <span className="text-[#252626]">{item.pro}</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {typeof item.enterprise === "boolean" ? (
                          item.enterprise ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <X className="w-5 h-5 text-red-500" />
                          )
                        ) : (
                          <span className="text-[#252626]">{item.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SlideUp>
      </section>

      <ScrollToTop />
    </div>
  )
}

