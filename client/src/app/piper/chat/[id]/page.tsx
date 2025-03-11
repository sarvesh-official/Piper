"use client"
import { useState, useRef, useEffect } from "react"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import confetti from "canvas-confetti"
import { useRouter, useParams } from "next/navigation"
import {dummyQuiz} from "@/data/quiz"

import { Upload, MessageCircle, CheckSquare, FileText, Send, User, X, FileImage, FileCode, FileSpreadsheet, ScrollText, AlertTriangle, CheckCircle2, XCircle, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@clerk/nextjs"
import { createChat, fetchChatById } from "@/app/api/chat-api/api"

// Quiz question type definition
export type QuizQuestion = {
  id: number;
  type: "mcq" | "true_false";
  question: string;
  options: string[];
  correctAnswer: string | number;
  explanation?: string;
}

export default function PiperChat() {
  const router = useRouter()
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<"upload" | "chat" | "quiz">("upload")
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadedFiles, setUploadedFiles] = useState<{ fileName: string; fileUrl: string; fileKey: string }[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [duplicateError, setDuplicateError] = useState<string | null>(null)
  
  // Chat states
  const [chatLoaded, setChatLoaded] = useState(false)
  const [chatData, setChatData] = useState<any>(null)
  
  // Quiz states
  const [quizActive, setQuizActive] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([])
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([])
  const [showResults, setShowResults] = useState(false)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizGenerated, setQuizGenerated] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [difficultyLevel, setDifficultyLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate")
  
  const { getToken, userId } = useAuth();
  
  // Check if we're viewing an existing chat
  useEffect(() => {
    const loadExistingChat = async () => {
      if (id && id !== 'new') {
        try {
          const token = await getToken();
          if (token) {
            const chat = await fetchChatById(id as string, token);
            setChatData(chat);
            
            // If chat has files, prevent new uploads
            if (chat.files && chat.files.length > 0) {
              setUploadedFiles(chat.files);
              setChatLoaded(true);
              setActiveTab("chat");
            }
          }
        } catch (error) {
          console.error("Error loading chat:", error);
        }
      }
    };
    
    loadExistingChat();
  }, [id, getToken]);

  // Function to trigger confetti fireworks
  const triggerConfettiFireworks = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  // Function to generate a quiz
  const generateQuiz = () => {
    
    setCurrentQuiz(dummyQuiz);
    setQuizGenerated(true);
  }

  // Function to start the quiz
  const startQuiz = () => {
    setUserAnswers(Array(currentQuiz.length).fill(null));
    setQuizActive(true);
    setShowResults(false);
    setQuizSubmitted(false);
  }

  // Function to handle answer selection
  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  }

  // Function to submit quiz
  const submitQuiz = () => {
    setShowResults(true);
    setQuizSubmitted(true);
    
    // Calculate score using the raw calculation function
    const score = calculateRawScore();
    
    // Check if perfect score and trigger confetti
    if (score === currentQuiz.length) {
      // Try to fire confetti with a slight delay to ensure DOM is ready
      setTimeout(() => {
        try {
          triggerConfettiFireworks();
        } catch (error) {
          console.error("Error firing confetti:", error);
        }
      }, 300);
    }
  }

  // Helper function to calculate score without relying on quizSubmitted state
  const calculateRawScore = () => {
    return userAnswers.reduce((score: number, answer: number | null, index: number) => {
      // Skip null answers (unanswered questions)
      if (answer === null) return score;
      
      const correctAnswer = currentQuiz[index].correctAnswer;
      
      // Handle both number and string comparisons
      if (typeof answer === 'number' && typeof correctAnswer === 'number') {
        return answer === correctAnswer ? score + 1 : score;
      }
      
      // Convert to strings for consistent comparison if types don't match
      return String(answer) === String(correctAnswer) ? score + 1 : score;
    }, 0);
  };

  // Function to calculate score (for display purposes)
  const calculateScore = () => {
    if (!quizSubmitted) return 0;
    return calculateRawScore();
  };

  // Function to restart quiz
  const restartQuiz = () => {
    startQuiz();
  }

  // Function to get answer status class
  const getAnswerClass = (questionIndex: number, optionIndex: number) => {
    if (!showResults) return "";
    
    const isCorrect = currentQuiz[questionIndex].correctAnswer === optionIndex;
    const isSelected = userAnswers[questionIndex] === optionIndex;
    
    if (isSelected && isCorrect) return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-500";
    if (isSelected && !isCorrect) return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-500";
    if (!isSelected && isCorrect) return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-500";
    
    return "";
  }


  const addFiles = (selectedFiles: File[]) => {
    if (files.length >= 3) {
      alert("Maximum 3 files can be uploaded")
      return
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
    if (type.includes("doc")) return <ScrollText className="h-4 w-4 text-piper-blue dark:text-piper-cyan" />
    if (type.includes("csv") || type.includes("excel") || type.includes("sheet")) 
      return <FileSpreadsheet className="h-4 w-4 text-green-500" />
    if (type.includes("image") || type.includes("png") || type.includes("jpg") || type.includes("jpeg")) 
      return <FileImage className="h-4 w-4 text-purple-600  dark:text-purple-500 " />
    if (type.includes("code") || type.includes("json") || type.includes("xml") || type.includes("html")) 
      return <FileCode className="h-4 w-4 text-yellow-500" />
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  // Function to download quiz as PDF
  const downloadQuizAsPdf = () => {
    setIsDownloading(true);
    
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 128);
      doc.text("Machine Learning Quiz", pageWidth / 2, 20, { align: "center" });
      
      // Add score if quiz is submitted
      if (quizSubmitted) {
        doc.setFontSize(14);
        doc.setTextColor(0, 102, 0);
        doc.text(
          `Score: ${calculateScore()} out of ${currentQuiz.length}`,
          pageWidth / 2,
          30,
          { align: "center" }
        );
      }
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        38,
        { align: "center" }
      );
      
      doc.line(20, 42, pageWidth - 20, 42);
      
      let yPos = 50;
      
      // Loop through each question
      currentQuiz.forEach((question, qIndex) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        // Add question number and type
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(
          `Question ${qIndex + 1} of ${currentQuiz.length} ${
            question.type === "mcq" ? "(Multiple Choice)" : "(True/False)"
          }`,
          20,
          yPos
        );
        yPos += 8;
        
        // Add question text
        doc.setFontSize(11);
        doc.text(question.question, 20, yPos, {
          maxWidth: pageWidth - 40,
        });
        
        // Calculate text height - rough estimate
        const textLines = doc.splitTextToSize(question.question, pageWidth - 40);
        yPos += textLines.length * 6 + 5;
        
        // Add options
        question.options.forEach((option, oIndex) => {
          // Check if we need a new page
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          // Determine if this option is correct or selected
          const isCorrect = oIndex === question.correctAnswer;
          const isSelected = userAnswers[qIndex] === oIndex;
          
          // Set color based on correctness and selection
          if (quizSubmitted) {
            if (isSelected && isCorrect) {
              doc.setTextColor(0, 128, 0); // Green for correct selection
            } else if (isSelected && !isCorrect) {
              doc.setTextColor(255, 0, 0); // Red for incorrect selection
            } else if (isCorrect) {
              doc.setTextColor(0, 128, 0); // Green for correct answer
            } else {
              doc.setTextColor(0, 0, 0); // Black for other options
            }
          } else {
            doc.setTextColor(0, 0, 0); // Black for all options if quiz not submitted
          }
          
          // Add option text
          doc.text(`${String.fromCharCode(65 + oIndex)}. ${option}`, 25, yPos);
          
          // Add marker for correct/selected answer
          if (quizSubmitted) {
            if (isCorrect) {
              doc.text("✓", 15, yPos);
            }
            if (isSelected && !isCorrect) {
              doc.text("✗", 15, yPos);
            }
          }
          
          yPos += 7;
        });
        
        // Add explanation if quiz is submitted
        if (quizSubmitted && question.explanation) {
          // Check if we need a new page
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          
          yPos += 3;
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text("Explanation:", 20, yPos);
          yPos += 5;
          
          // Add explanation text
          doc.setFontSize(10);
          doc.text(question.explanation, 25, yPos, {
            maxWidth: pageWidth - 45,
          });
          
          // Calculate text height
          const explanationLines = doc.splitTextToSize(
            question.explanation,
            pageWidth - 45
          );
          yPos += explanationLines.length * 5 + 10;
        } else {
          yPos += 15;
        }
        
        // Add a divider between questions
        if (qIndex < currentQuiz.length - 1) {
          doc.setDrawColor(200, 200, 200);
          doc.line(20, yPos - 5, pageWidth - 20, yPos - 5);
        }
      });
      
      // Save the PDF
      doc.save("machine-learning-quiz.pdf");
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was a problem generating your PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Handler for difficulty level selection
  const handleDifficultyChange = (level: "beginner" | "intermediate" | "advanced") => {
    setDifficultyLevel(level);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm overflow-hidden flex flex-col h-[83vh] max-w-5xl mx-auto">
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
          onClick={() => !chatLoaded && setActiveTab("upload")}
          disabled={chatLoaded}
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
        

        {/* Chat tab content - show uploaded files info when chat is loaded */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-full">
            {chatLoaded && uploadedFiles.length > 0 && (
              <div className="bg-accent/50 p-2 flex items-center justify-between border-b">
                <div className="flex items-center text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  <span>
                    {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'} uploaded: 
                    {uploadedFiles.map((file, index) => (
                      <span key={file.fileKey} className="ml-1 font-medium">
                        {file.fileName}{index < uploadedFiles.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            )}
            
            {/* Existing chat content */}
            <div className="flex-1 overflow-auto p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
              {/* AI message */} 
              <div className="flex items-start space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-[75%]">
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
              <div className="flex items-start justify-end space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-[75%] ml-auto">
                <div className="bg-piper-blue dark:bg-piper-cyan dark:text-piper-darkblue font-medium text-primary-foreground rounded-lg p-3 sm:p-4 shadow-sm">
                  <p className="text-xs sm:text-sm">Can you explain the difference between CNN and RNN models in simple terms?</p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
              </div>

              {/* AI response */}
              <div className="flex items-start space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-[75%]">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground">P</div>
                </div>
                <div className="bg-accent rounded-lg p-3 sm:p-4 shadow-sm">
                  <p className="text-xs sm:text-sm">
                    CNNs (Convolutional Neural Networks) are specialized for grid-like data such as images. They use filters to detect patterns like edges and textures, making them excellent for image recognition tasks.
                    <br /><br />
                    RNNs (Recurrent Neural Networks) are designed for sequential data like text or time series. They have a "memory" that allows them to consider previous inputs when processing the current input, making them good for language processing or speech recognition.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Chat input */}
            <div className="border-t p-2 sm:p-4">
              <div className="max-w-[85%] sm:max-w-[75%] mx-auto flex items-center bg-accent rounded-lg px-3 sm:px-4 py-1 sm:py-2">
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
              {!quizActive ? (
                // Quiz generator panel
                <div className="dark:bg-piper-darkblue border rounded-lg p-3 sm:p-5">
                  <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Generate Quiz</h3>

                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                        Select Documents
                      </label>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <input type="checkbox" id="doc1" className="mr-2" />
                          <label htmlFor="doc1" className="text-xs sm:text-sm">Machine Learning Guide.pdf</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="doc2" className="mr-2" />
                          <label htmlFor="doc2" className="text-xs sm:text-sm">Data Science Concepts.pdf</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="doc3" className="mr-2" />
                          <label htmlFor="doc3" className="text-xs sm:text-sm">Deep Learning Basics.pdf</label>
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
                        <button 
                          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                            difficultyLevel === "beginner" 
                              ? "bg-piper-blue dark:bg-piper-cyan text-primary-foreground dark:text-piper-darkblue" 
                              : "bg-accent"
                          }`}
                          onClick={() => handleDifficultyChange("beginner")}
                        >
                          Beginner
                        </button>
                        <button 
                          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                            difficultyLevel === "intermediate" 
                              ? "bg-piper-blue dark:bg-piper-cyan text-primary-foreground dark:text-piper-darkblue" 
                              : "bg-accent"
                          }`}
                          onClick={() => handleDifficultyChange("intermediate")}
                        >
                          Intermediate
                        </button>
                        <button 
                          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                            difficultyLevel === "advanced" 
                              ? "bg-piper-blue dark:bg-piper-cyan text-primary-foreground dark:text-piper-darkblue" 
                              : "bg-accent"
                          }`}
                          onClick={() => handleDifficultyChange("advanced")}
                        >
                          Advanced
                        </button>
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
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">Custom Prompt (Optional)</label>
                      <input
                        type="text"
                        className="block w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-md bg-background text-xs sm:text-base"
                        placeholder="e.g., Focus on neural networks and deep learning"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={generateQuiz}
                      className="flex-1 inline-flex items-center justify-center px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-primary-foreground bg-piper-blue dark:bg-piper-cyan hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/90 dark:text-piper-darkblue transition-colors"
                    >
                      Generate Quiz
                    </button>
                    {quizGenerated && (
                      <button 
                        onClick={startQuiz} 
                        className="flex-1 inline-flex items-center justify-center px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        Attend Quiz
                      </button>
                    )}
                  </div>
                  
                  {quizGenerated && (
                    <div className="mt-3 p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Quiz successfully generated! You can attend it now.
                    </div>
                  )}
                </div>
              ) : (
                // Quiz taking interface
                <div className="dark:bg-piper-darkblue border rounded-lg p-3 sm:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-medium">Machine Learning Quiz</h3>
                    {quizSubmitted && (
                      <div className="bg-accent rounded-md px-2 py-1 text-xs sm:text-sm font-medium">
                        Score: {calculateScore()}/{currentQuiz.length}
                      </div>
                    )}
                  </div>

                  {showResults && (
                    <div className={`mb-4 p-3 rounded-md text-sm ${calculateScore() === currentQuiz.length ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'}`}>
                      {calculateScore() === currentQuiz.length ? (
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          <span>Perfect score! You got all {calculateScore()} questions correct.</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <span>You got {calculateScore()} out of {currentQuiz.length} questions correct.</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-6">
                    {currentQuiz.map((question, qIndex) => (
                      <div key={question.id} className="border-b pb-4 last:border-b-0">
                        <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                          Question {qIndex + 1} of {currentQuiz.length}
                          {question.type === "mcq" ? " (Multiple Choice)" : " (True/False)"}
                        </p>
                        <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                          {question.question}
                        </p>

                        <div className="space-y-1.5 sm:space-y-2">
                          {question.options.map((option, oIndex) => (
                            <div 
                              key={oIndex}
                              className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${getAnswerClass(qIndex, oIndex)}`}
                              onClick={() => handleAnswerSelect(qIndex, oIndex)}
                            >
                              <input 
                                type="radio" 
                                id={`q${qIndex}-${oIndex}`} 
                                name={`q${qIndex}`}
                                checked={userAnswers[qIndex] === oIndex}
                                onChange={() => {}} // Controlled component
                                disabled={quizSubmitted}
                              />
                              <label htmlFor={`q${qIndex}-${oIndex}`} className="text-xs sm:text-sm cursor-pointer flex-1">
                                {option}
                              </label>
                              {showResults && userAnswers[qIndex] === oIndex && userAnswers[qIndex] !== question.correctAnswer && (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              {showResults && oIndex === question.correctAnswer && (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          ))}
                        </div>

                        {showResults && (
                          <div className="mt-2 text-xs bg-accent/50 p-2 rounded">
                            <p className="font-medium">Explanation:</p>
                            <p>{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {!quizSubmitted ? (
                      <button 
                        onClick={submitQuiz} 
                        className="flex-1 inline-flex items-center justify-center px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-primary-foreground bg-piper-blue dark:bg-piper-cyan hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/90 dark:text-piper-darkblue transition-colors"
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={restartQuiz}
                          className="flex-1 inline-flex items-center justify-center px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md bg-accent hover:bg-accent/90 transition-colors"
                        >
                          Retry Quiz
                        </button>
                        <button 
                          onClick={() => setQuizActive(false)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-primary-foreground bg-piper-blue dark:bg-piper-cyan hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/90 dark:text-piper-darkblue transition-colors"
                        >
                          Back to Generator
                        </button>
                        <button 
                          onClick={downloadQuizAsPdf}
                          disabled={isDownloading}
                          className="flex-1 inline-flex items-center justify-center px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {isDownloading ? (
                            <>
                              <span className="animate-pulse mr-1">Generating PDF...</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-3 w-3 mr-1" />
                              Download Quiz
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

