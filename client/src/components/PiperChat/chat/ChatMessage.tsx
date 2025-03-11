import { User } from "lucide-react"

type MessageType = "ai" | "user"

interface ChatMessageProps {
  type: MessageType
  content: string
}

export function ChatMessage({ type, content }: ChatMessageProps) {
  if (type === "ai") {
    return (
      <div className="flex items-start space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-[75%]">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <div className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground">P</div>
        </div>
        <div className="bg-accent rounded-lg p-3 sm:p-4 shadow-sm">
          <p className="text-xs sm:text-sm whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex items-start justify-end space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-[75%] ml-auto">
      <div className="bg-piper-blue dark:bg-piper-cyan dark:text-piper-darkblue font-medium text-primary-foreground rounded-lg p-3 sm:p-4 shadow-sm">
        <p className="text-xs sm:text-sm whitespace-pre-wrap">{content}</p>
      </div>
      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
        <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
      </div>
    </div>
  )
}
