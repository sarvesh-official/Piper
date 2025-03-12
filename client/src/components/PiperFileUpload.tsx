"use client"
import { useState, useRef } from "react"
import { Upload, MessageCircle, CheckSquare, FileText, X, FileImage, FileCode, FileSpreadsheet, Loader2, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { uploadFilesToBackend } from "@/app/api/file-upload/api"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"

export default function PiperFileUpload() {

  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [duplicateError, setDuplicateError] = useState<string | null>(null)
  
  // File size limit in bytes (5 MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  
  // Tooltip states
  const debugTooltips = false // Set to true to debug tooltips if needed

  const router = useRouter()
  const { getToken, userId } = useAuth();
  
  const handleUploadFiles = async () => {
    if (!files.length) return;
  
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress({});
  
    try {
      const token = await getToken();
  
      if (!userId || !token) {
        throw new Error("Authentication required. Please sign in.");
      }
  
      // Upload files and create chat in a single request
      const response = await uploadFilesToBackend(
        files,
        userId,
        token,
        (fileName, percentage) => {
          setUploadProgress((prev) => ({
            ...prev,
            [fileName]: percentage,
          }));
        }
      );
      console.log(response)
      if (response.chatId) {
        router.push(`/piper/chat/${response.chatId}`);
      } else {
        throw new Error("Failed to create chat");
      }
    } catch (error: any) {
      console.error("Upload failed:", error);
      setUploadError(error.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      addFiles(selectedFiles)
      // Reset the input value so the same file can be selected again
      e.target.value = ""
    }
  }

  const addFiles = (selectedFiles: File[]) => {
    if (files.length >= 3) {
      alert("Maximum 3 files can be uploaded")
      return
    }

    // Check for files exceeding size limit
    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setUploadError(
        oversizedFiles.length === 1
          ? `"${oversizedFiles[0].name}" exceeds the 5 MB size limit.`
          : `${oversizedFiles.length} files exceed the 5 MB size limit.`
      );
      
      // Filter out oversized files
      const validSizeFiles = selectedFiles.filter(file => file.size <= MAX_FILE_SIZE);
      if (validSizeFiles.length === 0) return;
      
      selectedFiles = validSizeFiles;
    } else {
      // Clear any previous error related to file size
      setUploadError(null);
    }

    // Check for duplicate files
    const duplicateFiles = selectedFiles.filter(newFile => 
      files.some(existingFile => existingFile.name === newFile.name)
    )

    if (duplicateFiles.length > 0) {
      setDuplicateError(
        duplicateFiles.length === 1
          ? `"${duplicateFiles[0].name}" has already been added.`
          : `${duplicateFiles.length} files have already been added.`
      )
      
      // Filter out duplicates
      const uniqueFiles = selectedFiles.filter(newFile => 
        !files.some(existingFile => existingFile.name === newFile.name)
      )
      
      if (uniqueFiles.length === 0) return
      
      // Add only unique files
      const newFiles = uniqueFiles.slice(0, 3 - files.length)
      setFiles((prev) => [...prev, ...newFiles])
    } else {
      // Clear any previous duplicate error
      setDuplicateError(null)
      
      const newFiles = selectedFiles.slice(0, 3 - files.length)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
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
    addFiles(droppedFiles)
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const getFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`
    }
  }

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-4 w-4 text-piper-darkblue dark:text-piper-lightblue"/>
    if (type.includes("doc")) return <FileText className="h-4 w-4 text-piper-blue dark:text-piper-cyan" />
    if (type.includes("csv") || type.includes("excel") || type.includes("sheet")) 
      return <FileSpreadsheet className="h-4 w-4 text-green-500" />
    if (type.includes("image") || type.includes("png") || type.includes("jpg") || type.includes("jpeg")) 
      return <FileImage className="h-4 w-4 text-purple-600  dark:text-purple-500 " />
    if (type.includes("code") || type.includes("json") || type.includes("xml") || type.includes("html")) 
      return <FileCode className="h-4 w-4 text-yellow-500" />
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm overflow-hidden flex flex-col h-[83vh] max-w-5xl mx-auto">
      {/* Tab navigation - kept but other tabs disabled */}
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
            "text-piper-blue dark:text-piper-cyan border-b-2 border-piper-blue dark:border-piper-cyan",
          )}
        >
          <Upload className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
          <span className="whitespace-nowrap">Upload Documents</span>
        </button>
        
        <div className="relative">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center",
                    "text-muted-foreground opacity-50 cursor-not-allowed",
                  )}
                  disabled
                >
                  <MessageCircle className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                  <span className="whitespace-nowrap">Ask Questions</span>
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom" 
                align="start" 
                sideOffset={5} 
                className={`z-[1000] p-2 text-xs ${
                  debugTooltips 
                    ? "bg-red-500 text-white border-2 border-white" 
                    : "bg-white dark:bg-gray-900 text-foreground border border-piper-blue dark:border-piper-cyan shadow-sm"
                }`}
              >
                Upload your documents first to enable chat
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Fallback tooltip for debugging purposes */}
          {debugTooltips && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-red-600 text-white text-sm rounded shadow-lg z-[9999] border-2 border-white">
              FALLBACK TOOLTIP: Upload your documents first to enable chat
            </div>
          )}
        </div>
        
        <div className="relative">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center",
                    "text-muted-foreground opacity-50 cursor-not-allowed",
                  )}
                  disabled
                >
                  <CheckSquare className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                  <span className="whitespace-nowrap">Generate Quiz</span>
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom" 
                align="start" 
                sideOffset={5} 
                className={`z-[1000] p-2 text-xs ${
                  debugTooltips 
                    ? "bg-red-500 text-white border-2 border-white" 
                    : "bg-white dark:bg-gray-900 text-foreground border border-piper-blue dark:border-piper-cyan shadow-sm"
                }`}
              >
                Upload your documents first to generate quizzes
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Fallback tooltip for debugging purposes */}
          {debugTooltips && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-red-600 text-white text-sm rounded shadow-lg z-[9999] border-2 border-white">
              FALLBACK TOOLTIP: Upload your documents first to generate quizzes
            </div>
          )}
        </div>
      </div>

      {/* App content */}
      <div className="flex-1 overflow-auto">
        {/* Upload tab content - always visible */}
        <div className="p-3 sm:p-6 h-full flex flex-col pt-6 items-center justify-center">
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
              {files.length > 0 && files.length < 3 && ` (${3 - files.length} more allowed)`}
              {files.length >= 3 && " (Maximum limit reached)"}
            </p>
            <p className="text-xs text-muted-foreground text-center mb-2">
              Maximum file size: 5 MB per file
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

          <div className="w-full max-w-xs sm:max-w-md mt-3 sm:mt-6 pb-3 sm:pb-6 md:pb-0">
            <h4 className="text-xs sm:text-sm font-normal mb-1 sm:mb-2">Selected Files</h4>

            <AnimatePresence>
              {files.length > 0 ? (
                <motion.div 
                  key="file-list" 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
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
                          {getFileIcon(file.type)}
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
                        <div className="absolute bottom-0 left-0 h-1 bg-piper-blue dark:bg-piper-cyan" style={{ width: `${uploadProgress[file.name]}%` }}></div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <span className="text-xs text-muted-foreground mr-2">No Files Uploaded Yet</span>
                </motion.div>
              )}
            </AnimatePresence>

            {uploadError && (
              <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded flex items-center">
                <X className="h-3 w-3 mr-1" />
                {uploadError}
              </div>
            )}

            {duplicateError && (
              <div className="mt-3 p-2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs rounded flex items-center">
                <X className="h-3 w-3 mr-1" />
                {duplicateError}
              </div>
            )}

            {files.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 sm:mt-4">
                <button 
                  onClick={handleUploadFiles}
                  disabled={isUploading}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white dark:text-piper-darkblue bg-piper-blue dark:bg-piper-cyan dark:hover:bg-piper-cyan/90 hover:bg-piper-blue/90 transition-colors disabled:opacity-70"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Uploading...
                    </>
                  ) : 'Process Files'}
                </button>
              </motion.div>
            )}
          </div>
          
          
        </div>
      </div>
    </div>
  )
}

