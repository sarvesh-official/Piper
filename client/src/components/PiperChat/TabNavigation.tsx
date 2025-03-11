import { Upload, MessageCircle, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"

type TabType = "upload" | "chat" | "quiz"

interface TabNavigationProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div
      className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "var(--scrollbar-thumb) var(--scrollbar-track)",
      }}
    >
      <button
        className={cn(
          "px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center",
          activeTab === "upload" ? "text-piper-blue dark:text-piper-cyan border-b-2 border-piper-blue dark:border-piper-cyan" : "text-muted-foreground",
        )}
        onClick={() => setActiveTab("upload")}
      >
        <Upload className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
        <span className="whitespace-nowrap">Upload Documents</span>
      </button>
      <button
        className={cn(
          "px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center",
          activeTab === "chat" ? "text-piper-blue dark:text-piper-cyan border-b-2 border-piper-blue dark:border-piper-cyan" : "text-muted-foreground",
        )}
        onClick={() => setActiveTab("chat")}
      >
        <MessageCircle className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
        <span className="whitespace-nowrap">Ask Questions</span>
      </button>
      <button
        className={cn(
          "px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center",
          activeTab === "quiz" ? "text-piper-blue dark:text-piper-cyan border-b-2 border-piper-blue dark:border-piper-cyan" : "text-muted-foreground",
        )}
        onClick={() => setActiveTab("quiz")}
      >
        <CheckSquare className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
        <span className="whitespace-nowrap">Generate Quiz</span>
      </button>
    </div>
  )
}
