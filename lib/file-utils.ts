import { createServerSupabaseClient } from "./supabase"

export async function getFilesFromServer() {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error("Not authenticated")
  }

  const { data, error } = await supabase
    .from("archivos_subidos")
    .select("*")
    .eq("usuario_id", user.id)
    .order("fecha_subida", { ascending: false })

  if (error) {
    console.error("Error fetching files:", error)
    return []
  }

  return data.map((file) => ({
    name: file.nombre_archivo,
    type: file.tipo,
    size: file.tamano,
    lastModified: new Date(file.fecha_subida).toLocaleString(),
    url: file.ruta_archivo,
  }))
}

