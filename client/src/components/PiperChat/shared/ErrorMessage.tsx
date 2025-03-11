import { XCircle, AlertTriangle, CheckCircle2 } from "lucide-react"

type MessageType = "error" | "warning" | "success"

interface ErrorMessageProps {
  message: string | null
  type?: MessageType
}

export function ErrorMessage({ message, type = "error" }: ErrorMessageProps) {
  if (!message) return null

  const styles = {
    error: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    warning: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200",
    success: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
  }

  const icons = {
    error: <XCircle className="h-3 w-3 mr-1" />,
    warning: <AlertTriangle className="h-3 w-3 mr-1" />,
    success: <CheckCircle2 className="h-3 w-3 mr-1" />
  }

  return (
    <div className={`mt-3 p-2 ${styles[type]} text-xs rounded flex items-center`}>
      {icons[type]}
      {message}
    </div>
  )
}
