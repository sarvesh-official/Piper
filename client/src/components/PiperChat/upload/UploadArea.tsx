import { useState, useRef } from "react"
import { Upload, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface UploadAreaProps {
  onFilesAdded: (files: File[]) => void
  isUploading: boolean
  filesCount: number
}

export function UploadArea({ onFilesAdded, isUploading, filesCount }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      onFilesAdded(selectedFiles)
      e.target.value = ""
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    onFilesAdded(droppedFiles)
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }
  
  return (
    <div
      className={cn(
        "w-full max-w-xs sm:max-w-md p-3 sm:p-6 border-2 bg-gray-50 border-dashed rounded-lg flex flex-col items-center cursor-pointer transition-colors duration-200 dark:bg-accent",
        isDragging ? "border-piper-blue dark:border-piper-cyan" : "border-gray-600",
        isUploading ? "opacity-50 pointer-events-none" : ""
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleBrowseClick}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

      <motion.div
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mb-2 sm:mb-4"
      >
        <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
      </motion.div>

      <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2 text-center">Upload your documents</h3>
      <p className="text-xs sm:text-sm text-muted-foreground text-center mb-2 sm:mb-4">
        Drag and drop your files here, or click to browse
        {filesCount > 0 && filesCount < 3 && ` (${3 - filesCount} more allowed)`}
        {filesCount >= 3 && " (Maximum limit reached)"}
      </p>
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-2 sm:mb-4 w-full justify-center">
        <div className="bg-accent dark:bg-gray-700 rounded px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium flex items-center">
          <FileText className="h-3 w-3 mr-1" />
          PDF
        </div>
        <div className="bg-accent dark:bg-gray-700 rounded px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium flex items-center">
          <FileText className="h-3 w-3 mr-1" />
          DOCX
        </div>
        <div className="bg-accent dark:bg-gray-700 rounded px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium flex items-center">
          <FileText className="h-3 w-3 mr-1" />
          TXT
        </div>
        <div className="bg-accent dark:bg-gray-700 rounded px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium flex items-center">
          <FileText className="h-3 w-3 mr-1" />
          CSV
        </div>
      </div>
    </div>
  )
}
