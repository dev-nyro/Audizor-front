"use client"

import * as React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = React.useState("personal")

  const tabs = [
    { id: "personal", label: "Personal" },
    { id: "chat", label: "Chat" },
    { id: "developers", label: "Desarrolladores" },
    { id: "plan", label: "Plan" },
    { id: "security", label: "Seguridad" },
    { id: "billing", label: "Facturación" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[70%] h-[70vh] p-0 flex gap-0">
        <div className="w-64 border-r h-full p-4 space-y-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full text-left px-4 py-2 rounded-lg transition-colors",
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === "personal" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-semibold">
                  A
                </div>
                <div>
                  <p className="text-xl font-semibold">agentedemonio12345@gmail.com</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nombre</label>
                  <Input />
                </div>
                <div>
                  <label className="text-sm font-medium">Apellido</label>
                  <Input />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input value="agentedemonio12345@gmail.com" readOnly />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Actualizar Contraseña</h3>
                  <p className="text-sm text-muted-foreground mb-4">La contraseña debe tener al menos 8 caracteres.</p>
                  <div className="space-y-4">
                    <Input type="password" placeholder="Nueva Contraseña" />
                    <Input type="password" placeholder="Confirmar Nueva Contraseña" />
                    <Button>Actualizar contraseña</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Add other tab contents as needed */}
        </div>
      </DialogContent>
    </Dialog>
  )
}

