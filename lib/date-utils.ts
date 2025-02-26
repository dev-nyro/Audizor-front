import { parseISO, format } from "date-fns"

export function formatDate(date: string | Date) {
  const parsedDate = typeof date === "string" ? parseISO(date) : date
  return format(parsedDate, "dd/MM/yyyy HH:mm:ss")
}

export function getFormattedDate(date: string | Date) {
  return formatDate(date)
}

