import { DashboardFix } from "@/components/Dashboard"
import { getFilesFromServer } from "@/lib/file-utils"

export default async function DashboardPage() {
  const initialFiles = await getFilesFromServer()
  return <DashboardFix initialFiles={initialFiles} />
}

