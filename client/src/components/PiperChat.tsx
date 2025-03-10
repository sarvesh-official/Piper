"use client"
import { useState, useRef } from "react"

import { Upload, MessageCircle, CheckSquare, FileText, Send, User, ChevronDown, X, FileImage, FileCode, FileSpreadsheet, File, ScrollText } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export default function PiperChat() {
  const [activeTab, setActiveTab] = useState("upload")
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

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

    const newFiles = selectedFiles.slice(0, 3 - files.length)
    setFiles((prev) => [...prev, ...newFiles])
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
    if (type.includes("doc")) return <ScrollText className="h-4 w-4 text-piper-blue dark:text-piper-cyan" />
    if (type.includes("csv") || type.includes("excel") || type.includes("sheet")) 
      return <FileSpreadsheet className="h-4 w-4 text-green-500" />
    if (type.includes("image") || type.includes("png") || type.includes("jpg") || type.includes("jpeg")) 
      return <FileImage className="h-4 w-4 text-purple-600  dark:text-purple-500 " />
    if (type.includes("code") || type.includes("json") || type.includes("xml") || type.includes("html")) 
      return <FileCode className="h-4 w-4 text-yellow-500" />
    return <FileText className="h-4 w-4 text-gray-500" />
  }


  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm overflow-hidden flex flex-col h-[83vh]">
      {/* Tab navigation */}
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

      {/* App content */}
      <div className="flex-1 overflow-auto">
        {/* Upload tab content */}
        {activeTab === "upload" && (
          <div className="p-3 sm:p-6 h-full flex flex-col pt-6 items-center justify-center">
            <div
              className={cn(
                "w-full max-w-xs sm:max-w-md p-3 sm:p-6 border-2 bg-gray-50 border-dashed rounded-lg flex flex-col items-center cursor-pointer transition-colors duration-200 dark:bg-accent",
                isDragging ? "border-piper-blue dark:border-piper-cyan" : "border-gray-600",
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
            <h4 className="text-xs sm:text-sm font-normal mb-1 sm:mb-2">Uploaded Files</h4>

              <AnimatePresence>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <motion.div
                        key={`${file.name}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                         className="flex items-center justify-between p-2 sm:p-3 bg-accent rounded-lg"
                      >
                        <div className="flex items-center overflow-hidden">
                        <div className="flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                            {getFileIcon(file.type)}
                          </div>

                        <span className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[180px]">{file.name}</span>
                        </div>
                        <div className="flex items-center flex-shrink-0">
                          <span className="text-xs text-muted-foreground mr-1 sm:mr-2">{getFileSize(file.size)}</span>
                          <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(index)
                          }}
                          className="p-1 rounded-sm hover:bg-red-200 dark:hover:bg-red-300 hover:text-red-500 transition-colors"
                          aria-label="Remove file"
                          >
                            <X className="h-3 sm:h-4 w-3 sm:w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
            
                  {files.length === 0 && (
                     <div className="flex items-center">
                     <span className="text-xs text-muted-foreground mr-2">No Files Uploaded Yet</span>
                   </div>
                  )}
              </AnimatePresence>

              {files.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 sm:mt-4">
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white dark:text-piper-darkblue bg-piper-blue dark:bg-piper-cyan dark:hover:bg-piper-cyan/90 hover:bg-piper-blue/90 transition-colors">
                    Process Files
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Chat tab content */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
              {/* AI message */}
              <div className="flex items-start space-x-2 sm:space-x-3 max-w-[90%] sm:max-w-[80%]">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground">P</div>
                </div>
                <div className="bg-accent rounded-lg p-3 sm:p-4 shadow-sm">
                  <p className="text-xs sm:text-sm">
                    I've processed your documents on machine learning. What would you like to know about neural networks
                    or deep learning concepts?
                  </p>
                </div>
              </div>

              {/* User message */}
              <div className="flex items-start justify-end space-x-2 sm:space-x-3 max-w-[90%] sm:max-w-[80%] ml-auto">
                <div className="bg-primary text-primary-foreground rounded-lg p-3 sm:p-4 shadow-sm">
                  <p className="text-xs sm:text-sm">Can you explain the difference between CNN and RNN models in simple terms?</p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
              </div>

              {/* AI response */}
              <div className="flex items-start space-x-2 sm:space-x-3 max-w-[90%] sm:max-w-[80%]">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground">P</div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="bg-accent rounded-lg p-3 sm:p-4 shadow-sm">
                    <p className="text-xs sm:text-sm">
                      <strong>CNNs (Convolutional Neural Networks)</strong> are like image specialists. They scan images
                      piece by piece to detect patterns like edges, textures, and shapes. Think of them as art critics
                      analyzing paintings by looking at small sections at a time. They're great for image
                      classification, object detection, and similar visual tasks.
                    </p>
                  </div>

                  <div className="bg-accent rounded-lg p-3 sm:p-4 shadow-sm">
                    <p className="text-xs sm:text-sm">
                      <strong>RNNs (Recurrent Neural Networks)</strong> are more like language experts that remember
                      what they've seen before. They're designed to work with sequences where each element relates to
                      what came before it. Imagine reading a book and understanding each page in the context of previous
                      pages. They excel in text generation, translation, and time-series prediction.
                    </p>
                  </div>

                  <div className="bg-accent rounded-lg p-3 sm:p-4 shadow-sm">
                    <p className="text-xs sm:text-sm">
                      <strong>Key Difference:</strong> CNNs focus on spatial patterns (in images) while RNNs handle
                      sequential patterns (like text or time series) where memory of previous inputs matters.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat input */}
            <div className="border-t p-2 sm:p-4">
              <div className="flex items-center bg-accent rounded-lg px-3 sm:px-4 py-1 sm:py-2">
                <input
                  type="text"
                  placeholder="Ask a question about your documents..."
                  className="flex-1 bg-transparent border-0 focus:ring-0 text-xs sm:text-sm outline-none"
                />
                <button className="ml-1 sm:ml-2 rounded-full p-1.5 sm:p-2 bg-primary text-primary-foreground flex items-center justify-center">
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quiz tab content */}
        {activeTab === "quiz" && (
          <div className="p-3 sm:p-6 h-full overflow-y-auto">
            <div className="max-w-full sm:max-w-lg mx-auto pb-4 space-y-4 sm:space-y-6">
              <div className="bg-card border rounded-lg p-3 sm:p-5">
                <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Generate Quiz</h3>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">Select Document</label>
                    <div className="relative">
                      <select className="block w-full pl-2 sm:pl-3 pr-8 sm:pr-10 py-1.5 sm:py-2 text-xs sm:text-base border rounded-md bg-background">
                        <option>Machine Learning Guide.pdf</option>
                        <option>Data Science Concepts.pdf</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">Number of Questions</label>
                    <input
                      type="number"
                      className="block w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-md bg-background text-xs sm:text-base"
                      defaultValue="10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">Difficulty Level</label>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-accent text-xs sm:text-sm font-medium">Beginner</button>
                      <button className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-primary text-xs sm:text-sm font-medium text-primary-foreground">
                        Intermediate
                      </button>
                      <button className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-accent text-xs sm:text-sm font-medium">Advanced</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">Question Types</label>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-1.5" defaultChecked />
                        <span className="text-xs sm:text-sm">Multiple Choice</span>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-1.5" defaultChecked />
                        <span className="text-xs sm:text-sm">True/False</span>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-1.5" />
                        <span className="text-xs sm:text-sm">Short Answer</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full inline-flex items-center justify-center px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                  Generate Quiz
                </button>
              </div>

              <div className="bg-card border rounded-lg p-3 sm:p-5">
                <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Quiz Preview</h3>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Question 1 of 10</p>
                    <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                      Which of the following is NOT a common activation function used in neural networks?
                    </p>

                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="q1-a" name="q1" />
                        <label htmlFor="q1-a" className="text-xs sm:text-sm">
                          ReLU (Rectified Linear Unit)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="q1-b" name="q1" />
                        <label htmlFor="q1-b" className="text-xs sm:text-sm">
                          Sigmoid
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="q1-c" name="q1" />
                        <label htmlFor="q1-c" className="text-xs sm:text-sm">
                          Quantum Activation Function
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="q1-d" name="q1" />
                        <label htmlFor="q1-d" className="text-xs sm:text-sm">
                          Tanh
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

