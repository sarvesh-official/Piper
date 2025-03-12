"use client"
import { useState, useEffect } from "react"
import { jsPDF } from "jspdf"
import confetti from "canvas-confetti"
import { dummyQuiz } from "@/data/quiz"
import { generateQuizFromApi, GenerateQuizRequest, QuizQuestion } from "@/app/api/quiz/api"
import { API_URL } from "@/app/api/file-upload/api"

import { Download, AlertTriangle, CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react"
import { useAuth } from "@clerk/nextjs"

interface PiperQuizProps {
  uploadedFiles?: { fileName: string; fileUrl: string; fileKey: string }[];
  chatId: string;
}
  
export default function PiperQuiz({ uploadedFiles = [], chatId}: PiperQuizProps) {
  // Quiz states
  const [quizActive, setQuizActive] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([])
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([])
  const [showResults, setShowResults] = useState(false)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizGenerated, setQuizGenerated] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [difficultyLevel, setDifficultyLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate")
  const [questionCount, setQuestionCount] = useState<number>(10)
  const [customPrompt, setCustomPrompt] = useState<string>("")
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState({
    mcq: true,
    trueFalse: true
  })
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [forceRegenerate, setForceRegenerate] = useState(false)
  const [hasExistingQuiz, setHasExistingQuiz] = useState(false)
  const [isLoadingExistingQuiz, setIsLoadingExistingQuiz] = useState(true)
  const [showQuizGenerator, setShowQuizGenerator] = useState(false)
  const [existingQuizGeneratedAt, setExistingQuizGeneratedAt] = useState<Date | null>(null)
  const { getToken } = useAuth()

  // Function to trigger confetti fireworks
  const triggerConfettiFireworks = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max) + min;

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

  // Function to handle file selection
  const handleFileSelection = (fileKey: string, isSelected: boolean) => {
    setSelectedFiles(prev => {
      if (isSelected) {
        return [...prev, fileKey];
      } else {
        return prev.filter(key => key !== fileKey);
      }
    });
  };

  // Function to handle question type selection
  const handleQuestionTypeChange = (type: 'mcq' | 'trueFalse', isSelected: boolean) => {
    setSelectedQuestionTypes(prev => ({
      ...prev,
      [type]: isSelected
    }));
  };

  // Function to fetch existing quiz for this chat
  const fetchExistingQuiz = async () => {
    try {
      setIsLoadingExistingQuiz(true);
      const token = await getToken();

      if (!token || !chatId) {
        setIsLoadingExistingQuiz(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/quiz/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentQuiz(data.quiz);
        setQuizGenerated(true);
        setHasExistingQuiz(true);
        setExistingQuizGeneratedAt(new Date(data.generatedAt));
      } else {
        // No existing quiz, show generator
        setHasExistingQuiz(false);
        setShowQuizGenerator(true);
      }
    } catch (error) {
      console.error("Error fetching existing quiz:", error);
      setHasExistingQuiz(false);
      setShowQuizGenerator(true);
    } finally {
      setIsLoadingExistingQuiz(false);
    }
  };

  // Check for existing quiz on component mount
  useEffect(() => {
    fetchExistingQuiz();
  }, [chatId]);

  // Function to generate a quiz
  const generateQuiz = async () => {
    // Validate inputs
    if (selectedFiles.length === 0) {
      setGenerationError("Please select at least one document");
      return;
    }

    if (!selectedQuestionTypes.mcq && !selectedQuestionTypes.trueFalse) {
      setGenerationError("Please select at least one question type");
      return;
    }
    const token = await getToken();

    if (!token) {
      setGenerationError("Authentication token is missing");
      return;
    }

    if (!chatId) {
      setGenerationError("Chat ID is missing");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Check if we have real files or demo files
      const actualFileKeys = uploadedFiles && uploadedFiles.length > 0
        ? selectedFiles // Use the selected fileKeys
        : selectedFiles.map(key => key); // In demo mode, just use the demo keys as-is
      
      const payload: GenerateQuizRequest = {
        fileKeys: actualFileKeys,
        questionCount,
        difficulty: difficultyLevel,
        questionTypes: selectedQuestionTypes,
        customPrompt: customPrompt || undefined,
        forceRegenerate // Add this flag to force regeneration
      };
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token is missing");
      }
      // Call API to generate quiz with all required parameters
      const quiz = await generateQuizFromApi(payload, token, chatId);
      
      // Set generated quiz
      setCurrentQuiz(quiz);
      setQuizGenerated(true);
      setHasExistingQuiz(true);
      setExistingQuizGeneratedAt(new Date());
      
      // Reset forceRegenerate after successful generation
      setForceRegenerate(false);
    } catch (error) {
      console.error("Error in quiz generation:", error);
      setGenerationError((error as Error).message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

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

  // Add function to toggle regeneration
  const toggleRegenerate = () => {
    setForceRegenerate(prev => !prev);
  };

  return (
    <div className="p-3 sm:p-6 h-full overflow-y-auto">
      <div className="max-w-full sm:max-w-lg mx-auto pb-4 space-y-4 sm:space-y-6">
        {isLoadingExistingQuiz ? (
          // Show loading state
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2">Loading quiz...</span>
          </div>
        ) : quizActive ? (
          // Quiz taking interface (no changes)
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

                  {showResults && question.explanation && (
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
        ) : hasExistingQuiz && !showQuizGenerator ? (
          // Show existing quiz options
          <div className="dark:bg-piper-darkblue border rounded-lg p-3 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-medium">Quiz Available</h3>
              {existingQuizGeneratedAt && (
                <div className="text-xs text-muted-foreground">
                  Generated: {new Date(existingQuizGeneratedAt).toLocaleString()}
                </div>
              )}
            </div>
            
            <p className="text-sm mb-4">
              A quiz with {currentQuiz.length} questions is ready for you to take.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={startQuiz} 
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Take Quiz
              </button>
              <button 
                onClick={() => {
                  setForceRegenerate(true);
                  generateQuiz();
                }}
                disabled={isGenerating}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-accent hover:bg-accent/80 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Generate New Questions
                  </>
                )}
              </button>
            </div>
            
            {/* Option to download existing quiz */}
            <div className="mt-3 flex">
              <button 
                onClick={downloadQuizAsPdf}
                disabled={isDownloading}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isDownloading ? (
                  <span className="animate-pulse">Generating PDF...</span>
                ) : (
                  <>
                    <Download className="h-3 w-3 mr-2" />
                    Download Quiz PDF
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Create Custom Quiz</h4>
                <button 
                  onClick={() => setShowQuizGenerator(true)}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  Show Options
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Quiz generator panel (no major changes)
          <div className="dark:bg-piper-darkblue border rounded-lg p-3 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-medium">Generate Quiz</h3>
              {hasExistingQuiz && (
                <button
                  onClick={() => setShowQuizGenerator(false)}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  Back to Existing Quiz
                </button>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  Select Documents
                </label>
                <div className="space-y-1">
                  {uploadedFiles && uploadedFiles.length > 0 ? (
                    uploadedFiles.map((file, index) => (
                      <div key={file.fileKey} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`doc${index}`} 
                          className="mr-2" 
                          checked={selectedFiles.includes(file.fileKey)}
                          onChange={(e) => handleFileSelection(file.fileKey, e.target.checked)} 
                        />
                        <label htmlFor={`doc${index}`} className="text-xs sm:text-sm">{file.fileName}</label>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="doc1" 
                          className="mr-2"
                          checked={selectedFiles.includes("doc1")}
                          onChange={(e) => handleFileSelection("doc1", e.target.checked)} 
                        />
                        <label htmlFor="doc1" className="text-xs sm:text-sm">Machine Learning Guide.pdf</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="doc2" 
                          className="mr-2"
                          checked={selectedFiles.includes("doc2")}
                          onChange={(e) => handleFileSelection("doc2", e.target.checked)}
                        />
                        <label htmlFor="doc2" className="text-xs sm:text-sm">Data Science Concepts.pdf</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="doc3" 
                          className="mr-2"
                          checked={selectedFiles.includes("doc3")}
                          onChange={(e) => handleFileSelection("doc3", e.target.checked)}
                        />
                        <label htmlFor="doc3" className="text-xs sm:text-sm">Deep Learning Basics.pdf</label>
                      </div>
                    </>
                  )}
                </div>                
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
                    <input 
                      type="checkbox" 
                      id="mcq" 
                      className="mr-1.5"
                      checked={selectedQuestionTypes.mcq}
                      onChange={(e) => handleQuestionTypeChange('mcq', e.target.checked)}
                    />
                    <span className="text-xs sm:text-sm">Multiple Choice</span>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="trueFalse" 
                      className="mr-1.5"
                      checked={selectedQuestionTypes.trueFalse}
                      onChange={(e) => handleQuestionTypeChange('trueFalse', e.target.checked)} 
                    />
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
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
              </div>
            </div>

            {generationError && (
              <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {generationError}
              </div>
            )}

            <div className="flex gap-2">
              <button 
                onClick={generateQuiz}
                disabled={isGenerating}
                className="flex-1 inline-flex items-center justify-center px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-primary-foreground bg-piper-blue dark:bg-piper-cyan hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/90 dark:text-piper-darkblue transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Quiz"
                )}
              </button>
              {quizGenerated && !isGenerating && (
                <button 
                  onClick={startQuiz} 
                  className="flex-1 inline-flex items-center justify-center px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Attend Quiz
                </button>
              )}
            </div>
            
            {quizGenerated && !isGenerating && (
              <div className="flex items-center justify-between mt-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Quiz successfully generated! You can attend it now.
                </div>
                
                {/* Add Regenerate Quiz checkbox */}
                <div className="flex items-center text-xs">
                  <input 
                    type="checkbox" 
                    id="regenerateQuiz" 
                    className="mr-1.5"
                    checked={forceRegenerate} 
                    onChange={toggleRegenerate}
                  />
                  <label htmlFor="regenerateQuiz">Regenerate new questions</label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
