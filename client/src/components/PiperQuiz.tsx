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

// Add interface for the API response structure
interface QuizApiResponse {
  quiz: {
    title: string;
    questions: QuizQuestion[];
  };
  isExisting: boolean;
  generatedAt: string;
}
  
export default function PiperQuiz({ uploadedFiles = [], chatId}: PiperQuizProps) {
  // Quiz states
  const [quizActive, setQuizActive] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([])
  const [quizTitle, setQuizTitle] = useState<string>("")
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([])
  const [showResults, setShowResults] = useState(false)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizGenerated, setQuizGenerated] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [difficultyLevel, setDifficultyLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate")
  const [questionCount, setQuestionCount] = useState<number>(10)
  const [maxQuestionCount, setMaxQuestionCount] = useState<number>(20)
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

  // Function to normalize question types for consistent handling
  const normalizeQuestionType = (question: any): QuizQuestion => {
    // Make a copy to avoid mutating the original
    const normalizedQuestion = { ...question };
    
    // Handle different question type formats
    if (normalizedQuestion.type === "truefalse" || normalizedQuestion.type === "true_false") {
      normalizedQuestion.type = "trueFalse"; // Normalize to the expected type
    }
    
    return normalizedQuestion as QuizQuestion;
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
        console.log("Quiz API response:", data); // Debug log
        
        // Handle the nested structure
        if (data.quiz && Array.isArray(data.quiz.questions)) {
          // Normalize question types for consistent handling
          const normalizedQuestions = data.quiz.questions.map(normalizeQuestionType);
          setCurrentQuiz(normalizedQuestions);
          setQuizTitle(data.quiz.title || "Quiz");
          setQuizGenerated(true);
          setHasExistingQuiz(true);
          setExistingQuizGeneratedAt(new Date(data.generatedAt));
        } else if (Array.isArray(data.quiz)) {
          // Direct array handling (fallback)
          const normalizedQuestions = data.quiz.map(normalizeQuestionType);
          setCurrentQuiz(normalizedQuestions);
          setQuizTitle("Quiz");
          setQuizGenerated(true);
          setHasExistingQuiz(true);
        } else {
          console.error("Unexpected quiz data format:", data);
          setHasExistingQuiz(false);
          setShowQuizGenerator(true);
        }
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
        forceRegenerate: true // Always set to true when manually generating
      };
      
      console.log("Quiz generation payload:", payload); // Debug log
      
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token is missing");
      }
      // Call API to generate quiz with all required parameters
      const quizResponse = await generateQuizFromApi(payload, token, chatId);
      console.log("Quiz generation response:", quizResponse); // Debug log
      
      // Handle the nested structure from the API
      if (quizResponse.quiz && Array.isArray(quizResponse.quiz.questions)) {
        // Normalize question types for consistent handling
        const normalizedQuestions = quizResponse.quiz.questions.map(normalizeQuestionType);
        setCurrentQuiz(normalizedQuestions);
        setQuizTitle(quizResponse.quiz.title || "Quiz");
      } else if (Array.isArray(quizResponse)) {
        // Fallback for direct array response
        const normalizedQuestions = quizResponse.map(normalizeQuestionType);
        setCurrentQuiz(normalizedQuestions);
        setQuizTitle("Quiz");
      } else {
        console.error("Unexpected quiz generation response format:", quizResponse);
        throw new Error("Invalid quiz format received from server");
      }
      
      setQuizGenerated(true);
      setHasExistingQuiz(true);
      setExistingQuizGeneratedAt(new Date());
      
    } catch (error) {
      console.error("Error in quiz generation:", error);
      setGenerationError((error as Error).message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
      // Reset forceRegenerate after attempt (whether successful or not)
      setForceRegenerate(false);
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
      
      // Convert both to numbers for comparison
      return Number(answer) === Number(correctAnswer) ? score + 1 : score;
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
    
    const isCorrect = Number(currentQuiz[questionIndex].correctAnswer) === optionIndex;
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
      doc.text(quizTitle || "Quiz", pageWidth / 2, 20, { align: "center" });
      
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


  // Handler for question count change
  const handleQuestionCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setQuestionCount(value);
  };

  // Helper function to check if all questions are answered
  const allQuestionsAnswered = () => {
    if (!userAnswers || userAnswers.length === 0) return false;
    return userAnswers.every(answer => answer !== null);
  };

  return (
    <div className="p-3 sm:p-6 h-full flex flex-col">
      <div className="w-full max-w-full sm:max-w-lg mx-auto h-full flex flex-col justify-center">
        {isLoadingExistingQuiz ? (
          // Show loading state with better centering
          <div className="flex items-center justify-center p-8 border rounded-lg bg-background dark:bg-piper-darkblue/50 shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-piper-blue dark:text-piper-cyan" />
            <span className="ml-2 text-muted-foreground">Loading quiz...</span>
          </div>
        ) : quizActive ? (
          // Quiz taking interface with single scrollbar and better layout
          <div className="bg-white dark:bg-piper-darkblue border rounded-lg shadow-sm flex flex-col h-full relative overflow-hidden pb-20">
            {/* Results message - only show if there are results */}
            {showResults && (
              <div className={`p-3 m-4 rounded-md text-sm ${calculateScore() === currentQuiz.length ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'}`}>
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

            {/* Questions container with proper scrolling */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {Array.isArray(currentQuiz) && currentQuiz.length > 0 ? (
                currentQuiz.map((question, qIndex) => (
                  <div key={question.id || qIndex} className="border-b pb-4 last:border-b-0">
                    <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                      Question {qIndex + 1} of {currentQuiz.length}
                      {question.type === "mcq" ? " (Multiple Choice)" : question.type === "true_false" ? " (True/False)" : ""}
                    </p>
                    <p className="text-xs sm:text-sm mb-3 sm:mb-4 font-medium">
                      {question.question}
                    </p>

                    <div className="space-y-1.5 sm:space-y-2">
                      {question.options && question.options.map((option, oIndex) => (
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
                          {showResults && userAnswers[qIndex] === oIndex && Number(userAnswers[qIndex]) !== Number(question.correctAnswer) && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          {showResults && Number(oIndex) === Number(question.correctAnswer) && (
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
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  No quiz questions available. Please try regenerating the quiz.
                </div>
              )}
            </div>

            {/* Fixed action buttons at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-piper-darkblue p-3 border-t">
              <div className="flex flex-wrap gap-2">
                {!quizSubmitted ? (
                  <button 
                    onClick={submitQuiz} 
                    disabled={!allQuestionsAnswered()}
                    className="flex-1 inline-flex items-center justify-center px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-piper-blue dark:bg-piper-cyan hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/90 dark:text-piper-darkblue transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {allQuestionsAnswered() ? (
                      "Submit Quiz"
                    ) : (
                      `Answer all ${currentQuiz.length - userAnswers.filter(a => a !== null).length} remaining questions`
                    )}
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={restartQuiz}
                      className="flex-1 inline-flex items-center justify-center px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md bg-accent/80 hover:bg-accent/90 transition-colors"
                    >
                      Retry Quiz
                    </button>
                    <button 
                      onClick={() => setQuizActive(false)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-piper-blue dark:bg-piper-cyan hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/90 dark:text-piper-darkblue transition-colors"
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
              
              {!quizSubmitted && (
                <div className="text-xs text-center mt-1 text-muted-foreground">
                  {userAnswers.filter(a => a !== null).length} of {currentQuiz.length} questions answered
                </div>
              )}

              {/* Show score here if submitted */}
              {quizSubmitted && (
                <div className="text-xs text-center mt-1 font-medium">
                  Score: {calculateScore()}/{currentQuiz.length}
                </div>
              )}
            </div>
          </div>
        ) : hasExistingQuiz && !showQuizGenerator ? (
          // Show existing quiz options with consistent styling and vertical centering
          <div className="bg-white dark:bg-piper-darkblue border rounded-lg p-4 sm:p-6 shadow-sm self-center w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-medium text-foreground">{quizTitle || "Quiz Available"}</h3>
              {existingQuizGeneratedAt && (
                <div className="text-xs text-muted-foreground">
                  Generated: {new Date(existingQuizGeneratedAt).toLocaleString()}
                </div>
              )}
            </div>
            
            <p className="text-sm mb-4 text-foreground/90">
              A quiz with {Array.isArray(currentQuiz) ? currentQuiz.length : 0} questions is ready for you to take.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={startQuiz} 
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
              >
                Take Quiz
              </button>
              <button 
                onClick={() => {
                  setShowQuizGenerator(true); // Just show the generator, we'll set forceRegenerate when generating
                }}
                disabled={isGenerating}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-accent/80 hover:bg-accent transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Customize New Quiz
                  </>
                )}
              </button>
            </div>
            {/* Success message without regenerate checkbox */}
            {quizGenerated && !isGenerating && (
              <div className="mt-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span>Quiz successfully generated! You can attend it now.</span>
                </div>
              </div>
            )}
            
            {/* Option to download existing quiz */}
            <div className="mt-3 flex">
              <button 
                onClick={downloadQuizAsPdf}
                disabled={isDownloading}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-piper-blue dark:bg-piper-cyan text-white dark:text-piper-darkblue hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/90 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
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
          </div>
        ) : (
          // Quiz generator panel with improved styling and vertical centering
          <div className="bg-white dark:bg-piper-darkblue border rounded-lg p-4 sm:p-6 shadow-sm self-center w-full">
            {/* ...existing code... */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-medium text-foreground">Generate Quiz</h3>
              {hasExistingQuiz && (
                <button
                  onClick={() => setShowQuizGenerator(false)}
                  className="text-xs text-piper-blue dark:text-piper-cyan hover:underline"
                >
                  Back to Existing Quiz
                </button>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground/80 mb-1">
                  Select Documents
                </label>
                <div className="space-y-1">
                  {uploadedFiles && uploadedFiles.length > 0 ? (
                    uploadedFiles.map((file, index) => (
                      <div key={file.fileKey} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`doc${index}`} 
                          className="mr-2 accent-piper-blue dark:accent-piper-cyan" 
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
                          className="mr-2 accent-piper-blue dark:accent-piper-cyan"
                          checked={selectedFiles.includes("doc1")}
                          onChange={(e) => handleFileSelection("doc1", e.target.checked)} 
                        />
                        <label htmlFor="doc1" className="text-xs sm:text-sm">Machine Learning Guide.pdf</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="doc2" 
                          className="mr-2 accent-piper-blue dark:accent-piper-cyan"
                          checked={selectedFiles.includes("doc2")}
                          onChange={(e) => handleFileSelection("doc2", e.target.checked)}
                        />
                        <label htmlFor="doc2" className="text-xs sm:text-sm">Data Science Concepts.pdf</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="doc3" 
                          className="mr-2 accent-piper-blue dark:accent-piper-cyan"
                          checked={selectedFiles.includes("doc3")}
                          onChange={(e) => handleFileSelection("doc3", e.target.checked)}
                        />
                        <label htmlFor="doc3" className="text-xs sm:text-sm">Deep Learning Basics.pdf</label>
                      </div>
                    </>
                  )}
                </div>                
              </div>

              {/* Add question count slider */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground/80 mb-1">
                  Number of Questions: <span className="font-semibold text-piper-blue dark:text-piper-cyan">{questionCount}</span>
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs">5</span>
                  <input
                    type="range"
                    min="5"
                    max={maxQuestionCount}
                    value={questionCount}
                    onChange={handleQuestionCountChange}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-piper-blue dark:accent-piper-cyan"
                  />
                  <span className="text-xs">{maxQuestionCount}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground/80 mb-1">Difficulty Level</label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                      difficultyLevel === "beginner" 
                        ? "bg-piper-blue dark:bg-piper-cyan text-white dark:text-piper-darkblue" 
                        : "bg-accent/70 hover:bg-accent/90"
                    }`}
                    onClick={() => handleDifficultyChange("beginner")}
                  >
                    Beginner
                  </button>
                  <button 
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                      difficultyLevel === "intermediate" 
                        ? "bg-piper-blue dark:bg-piper-cyan text-white dark:text-piper-darkblue" 
                        : "bg-accent/70 hover:bg-accent/90"
                    }`}
                    onClick={() => handleDifficultyChange("intermediate")}
                  >
                    Intermediate
                  </button>
                  <button 
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                      difficultyLevel === "advanced" 
                        ? "bg-piper-blue dark:bg-piper-cyan text-white dark:text-piper-darkblue" 
                        : "bg-accent/70 hover:bg-accent/90"
                    }`}
                    onClick={() => handleDifficultyChange("advanced")}
                  >
                    Advanced
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground/80 mb-1">Question Types</label>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="mcq" 
                      className="mr-1.5 accent-piper-blue dark:accent-piper-cyan"
                      checked={selectedQuestionTypes.mcq}
                      onChange={(e) => handleQuestionTypeChange('mcq', e.target.checked)}
                    />
                    <span className="text-xs sm:text-sm">Multiple Choice</span>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="trueFalse" 
                      className="mr-1.5 accent-piper-blue dark:accent-piper-cyan"
                      checked={selectedQuestionTypes.trueFalse}
                      onChange={(e) => handleQuestionTypeChange('trueFalse', e.target.checked)} 
                    />
                    <span className="text-xs sm:text-sm">True/False</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground/80 mb-1">Custom Prompt (Optional)</label>
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
              <div className="mb-4 p-2.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs rounded flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {generationError}
              </div>
            )}

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  generateQuiz(); // No need to set forceRegenerate here as it's always true in the function
                }}
                disabled={isGenerating}
                className="flex-1 inline-flex items-center justify-center px-10 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-piper-blue dark:bg-piper-cyan hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/90 dark:text-piper-darkblue transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    {quizGenerated ? "Regenerating..." : "Generating..."}
                  </>
                ) : (
                  <>
                    {quizGenerated && <RefreshCw className="h-4 w-4 mr-2" />}
                    {quizGenerated ? "Regenerate Quiz" : "Generate Quiz"}
                  </>
                )}
              </button>
              {quizGenerated && !isGenerating && (
                <button 
                  onClick={startQuiz} 
                  className="flex-1 inline-flex items-center justify-center px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                >
                  Attend Quiz
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
