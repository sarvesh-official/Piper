import { useState } from "react"
import { Send } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message)
      setMessage("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-2 sm:p-4">
      <div className="max-w-[85%] sm:max-w-[75%] mx-auto flex items-center bg-accent rounded-lg px-3 sm:px-4 py-1 sm:py-2">
        <input
          type="text"
          placeholder="Ask a question about your documents..."
          className="flex-1 bg-transparent border-0 focus:ring-0 text-xs sm:text-sm outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={!message.trim() || isLoading}
          className="ml-1 sm:ml-2 rounded-full p-1.5 sm:p-2 bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
        >
          <Send className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>
    </form>
  )
}
