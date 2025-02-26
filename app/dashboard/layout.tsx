import { requireAuth } from "@/lib/auth"
import type React from "react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  return <>{children}</>
}

