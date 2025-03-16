"use client"
import { useState, useEffect } from "react"
import { jsPDF } from "jspdf"
import confetti from "canvas-confetti"
import { Download, AlertTriangle, CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react"

interface CourseQuizProps {
  quizContent: string;
  courseId: string;
  onComplete?: (score: number, total: number) => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  type: 'mcq' | 'trueFalse';
}

export default function CourseQuiz({ quizContent, courseId, onComplete }: CourseQuizProps) {
  // Quiz states
  const [quizActive, setQuizActive] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([])
  const [quizTitle, setQuizTitle] = useState<string>("Course Quiz")
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([])
  const [showResults, setShowResults] = useState(false)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [quizParsed, setQuizParsed] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  // Parse the quiz content on component mount
  useEffect(() => {
    if (quizContent && !quizParsed) {
      parseQuizContent(quizContent);
    }
  }, [quizContent]);

  // Function to parse markdown quiz content into structured questions
  const parseQuizContent = (content: string) => {
    try {
      // Clean up the content first
      const cleanContent = content.replace(/\r\n/g, '\n').trim();
      
      // Extract title if present as first heading
      const titleMatch = cleanContent.match(/^#\s+(.+)$/m);
      if (titleMatch && titleMatch[1]) {
        setQuizTitle(titleMatch[1].trim());
      }
      
      // Parse questions - standardized format from backend
      const questions: QuizQuestion[] = [];
      
      // Pattern matches "**X. Question text**" followed by lettered options and correct answer
      const questionPattern = /\*\*(\d+)\.\s+(.*?)\*\*\s*([\s\S]*?)(?=\*\*\d+\.|\s*$)/g;
      let questionMatch;
      
      while ((questionMatch = questionPattern.exec(cleanContent)) !== null) {
        const questionNumber = questionMatch[1];
        const questionText = questionMatch[2].trim();
        const questionContent = questionMatch[3].trim();
        
        // Extract options - each starts with a letter followed by ")"
        const options: string[] = [];
        const optionPattern = /([a-d])\)\s+(.*?)(?=\n[a-d]\)|\n\n\*\*Correct Answer|\s*$)/gs;
        let optionMatch;
        
        while ((optionMatch = optionPattern.exec(questionContent)) !== null) {
          options.push(optionMatch[2].trim());
        }
        
        // Find the correct answer - standardized format "**Correct Answer: X)**"
        let correctAnswer = 0;
        const correctAnswerMatch = questionContent.match(/\*\*Correct Answer:\s*([a-d])\)/i);
        
        if (correctAnswerMatch && correctAnswerMatch[1]) {
          correctAnswer = 'abcd'.indexOf(correctAnswerMatch[1].toLowerCase());
        }
        
        // Extract explanation - everything after "**Correct Answer: X)**"
        let explanation = '';
        if (correctAnswerMatch) {
          const afterCorrectAnswer = questionContent.substring(
            questionContent.indexOf(correctAnswerMatch[0]) + correctAnswerMatch[0].length
          );
          explanation = afterCorrectAnswer.trim();
        }
        
        // Add the question if we have valid data
        if (questionText && options.length > 0) {
          questions.push({
            id: parseInt(questionNumber) - 1,
            question: questionText,
            options,
            correctAnswer,
            explanation,
            type: 'mcq'
          });
        }
      }
      
      // If we found questions, use them
      if (questions.length > 0) {
        setCurrentQuiz(questions);
        setQuizActive(true);
        setUserAnswers(Array(questions.length).fill(null));
        setQuizParsed(true);
        return;
      }
      
      setParseError("Couldn't identify quiz questions. The quiz format may be incorrect.");
    } catch (error) {
      console.error("Error parsing quiz content:", error);
      setParseError("Failed to parse quiz content");
    }
  };

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
    
    // Calculate score
    const score = calculateRawScore() || 0;
    
    // Notify parent component if callback provided
    if (onComplete) {
      onComplete(score, currentQuiz.length);
    }
    
    // Check if perfect score and trigger confetti
    if (score === currentQuiz.length) {
      setTimeout(() => {
        try {
          triggerConfettiFireworks();
        } catch (error) {
          console.error("Error firing confetti:", error);
        }
      }, 300);
    }
  }

  // Helper function to calculate score
  const calculateRawScore = () => {
    return userAnswers.reduce((score: number, answer, index) => {
      if (answer === null) return score;
      return Number(answer) === Number(currentQuiz[index].correctAnswer) ? score + 1 : score;
    }, 0);
  };

  // Function to calculate final score
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
      doc.text(quizTitle, pageWidth / 2, 20, { align: "center" });
      
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
        `Date: ${new Date().toLocaleDateString()}`,
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
        
        yPos += 7;
        
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
      doc.save(`${quizTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was a problem generating your PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper function to check if all questions are answered
  const allQuestionsAnswered = () => {
    if (!userAnswers || userAnswers.length === 0) return false;
    return userAnswers.every(answer => answer !== null);
  };

  if (parseError) {
    return (
      <div className="p-3 sm:p-4 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-600 dark:text-red-400">Failed to load quiz</h3>
            <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">{parseError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quizParsed) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-8">
        <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-piper-blue dark:text-piper-cyan" />
        <span className="ml-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">Loading quiz...</span>
      </div>
    );
  }

  if (!quizActive) {
    // Show quiz start screen
    return (
      <div className="bg-white dark:bg-piper-darkblue border rounded-lg p-4 sm:p-5 shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">{quizTitle}</h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
          This quiz contains {currentQuiz.length} questions to test your knowledge.
        </p>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <div className="text-xs sm:text-sm">
            <span className="text-gray-500 dark:text-gray-400">Questions: </span>
            <span className="font-medium">{currentQuiz.length}</span>
          </div>
          <button
            onClick={startQuiz}
            className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-piper-blue dark:bg-piper-cyan text-white dark:text-piper-darkblue rounded-md hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/90 transition-colors font-medium text-xs sm:text-sm"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // Quiz taking interface
  return (
    <div className="bg-white dark:bg-piper-darkblue border rounded-lg shadow-sm flex flex-col h-full relative overflow-hidden pb-16 sm:pb-20">
      {/* Results message - only show if there are results */}
      {showResults && (
        <div className={`px-3 py-2 sm:p-3 mx-2 sm:m-4 rounded-md text-xs sm:text-sm ${calculateScore() === currentQuiz.length ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'}`}>
          {calculateScore() === currentQuiz.length ? (
            <div className="flex items-center">
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>Perfect score! You got all {calculateScore()} questions correct.</span>
            </div>
          ) : (
            <div className="flex items-center">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>You got {calculateScore()} out of {currentQuiz.length} questions correct.</span>
            </div>
          )}
        </div>
      )}

      {/* Questions container with proper scrolling */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {currentQuiz.map((question, qIndex) => (
          <div key={question.id || qIndex} className="border-b pb-3 sm:pb-4 last:border-b-0">
            <p className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-3">
              Question {qIndex + 1} of {currentQuiz.length}
              {question.type === "mcq" ? " (Multiple Choice)" : question.type === "trueFalse" ? " (True/False)" : ""}
            </p>
            <p className="text-sm sm:text-base mb-2 sm:mb-4 font-medium">
              {question.question}
            </p>

            <div className="space-y-1 sm:space-y-2">
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
                    className="mr-2 min-w-4"
                  />
                  <label htmlFor={`q${qIndex}-${oIndex}`} className="text-xs sm:text-sm cursor-pointer flex-1 py-1">
                    {option}
                  </label>
                  {showResults && userAnswers[qIndex] === oIndex && Number(userAnswers[qIndex]) !== Number(question.correctAnswer) && (
                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-red-500" />
                  )}
                  {showResults && Number(oIndex) === Number(question.correctAnswer) && (
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-green-500" />
                  )}
                </div>
              ))}
            </div>

            {showResults && question.explanation && (
              <div className="mt-2 sm:mt-3 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <p className="font-medium text-xs sm:text-sm">Explanation:</p>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{question.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fixed action buttons at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-piper-darkblue p-2 sm:p-3 border-t">
        <div className="flex flex-col sm:flex-row gap-2">
          {!quizSubmitted ? (
            <button 
              onClick={submitQuiz} 
              disabled={!allQuestionsAnswered()}
              className="w-full inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-piper-blue dark:bg-piper-cyan hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/90 dark:text-piper-darkblue transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {allQuestionsAnswered() ? (
                "Submit Quiz"
              ) : (
                <span className="truncate">
                  Answer {currentQuiz.length - userAnswers.filter(a => a !== null).length} more question{currentQuiz.length - userAnswers.filter(a => a !== null).length !== 1 ? 's' : ''}
                </span>
              )}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row w-full gap-2">
              <button 
                onClick={restartQuiz}
                className="w-full sm:flex-1 inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                Retry
              </button>
              <button 
                onClick={downloadQuizAsPdf}
                disabled={isDownloading}
                className="w-full sm:flex-1 inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        
        {!quizSubmitted && (
          <div className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">
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
  );
}