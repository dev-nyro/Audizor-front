import { Dashboard } from "@/components/Dashboard"
import { getFilesFromServer } from "@/lib/file-utils"

export default async function DashboardPage() {
  const initialFiles = await getFilesFromServer()
  return <Dashboard initialFiles={initialFiles} />
}

