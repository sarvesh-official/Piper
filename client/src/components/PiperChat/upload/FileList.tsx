import { X, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { FileIcon } from "../shared/FileIcon"

interface FileListProps {
  files: File[]
  removeFile: (index: number) => void
  isUploading: boolean
  uploadProgress: { [key: string]: number }
}

export function FileList({ files, removeFile, isUploading, uploadProgress }: FileListProps) {
  const getFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`
    }
  }

  return (
    <AnimatePresence>
      <div className="space-y-2">
        {files.map((file, index) => (
          <motion.div
            key={`${file.name}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between p-2 sm:p-3 bg-accent rounded-lg relative overflow-hidden"
          >
            <div className="flex items-center overflow-hidden">
              <div className="flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                <FileIcon fileType={file.type} />
              </div>
              <span className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[180px]">{file.name}</span>
            </div>
            <div className="flex items-center flex-shrink-0">
              {isUploading && uploadProgress[file.name] !== undefined ? (
                <span className="text-xs text-muted-foreground mr-1 sm:mr-2">{uploadProgress[file.name]}%</span>
              ) : (
                <span className="text-xs text-muted-foreground mr-1 sm:mr-2">{getFileSize(file.size)}</span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
                disabled={isUploading}
                className="p-1 rounded-sm hover:bg-red-200 dark:hover:bg-red-300 hover:text-red-500 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Remove file"
              >
                <X className="h-3 sm:h-4 w-3 sm:w-4" />
              </button>
            </div>
            {isUploading && uploadProgress[file.name] !== undefined && (
              <div 
                className="absolute bottom-0 left-0 h-1 bg-piper-blue dark:bg-piper-cyan" 
                style={{ width: `${uploadProgress[file.name]}%` }}
              />
            )}
          </motion.div>
        ))}
        
        {files.length === 0 && (
          <div className="flex items-center">
            <span className="text-xs text-muted-foreground mr-2">No Files Uploaded Yet</span>
          </div>
        )}
      </div>
    </AnimatePresence>
  )
}
