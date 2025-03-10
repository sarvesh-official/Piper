"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  File,
  FileText,
  BookOpen,
  Sparkles,
  Sliders,
  Target,
  Clock,
  BarChart,
  Check,
  Layers,
  ChevronDown,
  Users,
  GraduationCap,
  Award,
  BookMarked,
  Star,
  Loader2
} from "lucide-react";
import { toast } from "react-toastify";

// Module types for type safety
type LessonType = 'lesson' | 'interactive' | 'code' | 'quiz';

interface Lesson {
  type: LessonType;
  title: string;
  duration: string;
}

interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
}

const GenerateCourse = () => {
  const router = useRouter();

  // Course generator state
  const [courseComplexity, setCourseComplexity] = useState(50);
  const [courseDuration, setCourseDuration] = useState(60);
  const [interactivityLevel, setInteractivityLevel] = useState(70);
  const [courseTitle, setCourseTitle] = useState(
    "Introduction to Quantum Computing"
  );
  
  // Options state
  const [includeQuizzes, setIncludeQuizzes] = useState(true);
  const [includeInteractive, setIncludeInteractive] = useState(true);
  const [includeCode, setIncludeCode] = useState(true);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedCourseId, setGeneratedCourseId] = useState("");
  
  // Error state
  const [titleError, setTitleError] = useState("");
  
  // Module accordion state - default expanded for first module
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 1: true });
  
  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Module data
  const moduleData: Module[] = [
    {
      id: 1,
      title: 'Fundamentals of Quantum Mechanics',
      lessons: [
        { type: 'lesson', title: 'Quantum States and Superposition', duration: '20 min' },
        { type: 'interactive', title: 'Visualizing Superposition', duration: '15 min' },
        { type: 'code', title: 'Quantum State Representation', duration: '18 min' },
        { type: 'quiz', title: 'Module 1 Assessment', duration: '10 min' },
      ],
    },
    {
      id: 2,
      title: 'Quantum Bits and Information',
      lessons: [
        { type: 'lesson', title: 'Introduction to Qubits', duration: '18 min' },
        { type: 'interactive', title: 'Qubit Operations', duration: '15 min' },
        { type: 'code', title: 'Quantum Gates Implementation', duration: '20 min' },
        { type: 'quiz', title: 'Module 2 Assessment', duration: '10 min' },
      ],
    },
    {
      id: 3,
      title: 'Quantum Algorithms',
      lessons: [
        { type: 'lesson', title: 'Quantum Parallelism', duration: '22 min' },
        { type: 'interactive', title: 'Exploring Shor\'s Algorithm', duration: '25 min' },
        { type: 'code', title: 'Implementing Grover\'s Search', duration: '30 min' },
        { type: 'quiz', title: 'Module 3 Assessment', duration: '15 min' },
      ],
    },
    {
      id: 4,
      title: 'Quantum Entanglement & Teleportation',
      lessons: [
        { type: 'lesson', title: 'Understanding Entanglement', duration: '20 min' },
        { type: 'interactive', title: 'Bell States Demonstration', duration: '18 min' },
        { type: 'code', title: 'Quantum Teleportation Protocol', duration: '25 min' },
        { type: 'quiz', title: 'Module 4 Assessment', duration: '10 min' },
      ],
    },
    {
      id: 5,
      title: 'Quantum Computing Applications',
      lessons: [
        { type: 'lesson', title: 'Quantum Machine Learning', duration: '28 min' },
        { type: 'interactive', title: 'Quantum Chemistry Simulations', duration: '22 min' },
        { type: 'code', title: 'Quantum Error Correction', duration: '24 min' },
        { type: 'quiz', title: 'Final Assessment', duration: '20 min' },
      ],
    },
  ];
  
  // Toggle module expansion
  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleGenerateCourse = async () => {
    // Validate input
    if (!courseTitle.trim()) {
      setTitleError("Please enter a course title");
      return;
    }
    setTitleError("");
    
    // Start generation
    setIsGenerating(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create a mock course ID - in a real app this would come from the backend
      setGeneratedCourseId("2");
      
      setIsGenerated(true);
    } catch (error) {
      console.error("Error generating course:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleStartLearning = () => {
    if (generatedCourseId) {
      router.push(`/piper/learning/course/${generatedCourseId}`);
    }
  };

  const handleBookmark = () => {
    // Toggle bookmark state for visual feedback
    setIsBookmarked(prev => !prev);
    
    // Show toast notification
    toast.success("Course added to bookmarks", {
      position: "bottom-center",
      style: {
        background: "#333",
        color: "#fff",
      },
    });
    
    // Here you would typically also save this to user's bookmarks in a database
  };

  // Render a lesson based on its type
  const renderLesson = (lesson: Lesson) => {
    // Skip rendering based on user options
    if (lesson.type === 'interactive' && !includeInteractive) return null;
    if (lesson.type === 'code' && !includeCode) return null;
    if (lesson.type === 'quiz' && !includeQuizzes) return null;
    
    let icon;
    let iconWrapperClass = "w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center";
    let titleClass = "text-sm";
    
    switch(lesson.type) {
      case 'lesson':
        icon = <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
        break;
      case 'interactive':
        icon = <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
        break;
      case 'code':
        icon = <File className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
        break;
      case 'quiz':
        icon = <Award className="h-4 w-4 text-piper-blue dark:text-piper-cyan" />;
        iconWrapperClass = "w-8 h-8 rounded-full bg-piper-blue/20 dark:bg-piper-cyan/20 flex items-center justify-center";
        titleClass = "text-sm font-medium text-piper-blue dark:text-piper-cyan";
        break;
    }
    
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={iconWrapperClass}>
            {icon}
          </div>
          <span className={titleClass}>
            {lesson.type === 'interactive' && 'Interactive: '}
            {lesson.type === 'code' && 'Code Example: '}
            {lesson.title}
          </span>
        </div>
        <span className="text-xs text-gray-500">{lesson.duration}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto p-3 md:p-6">
      {/* Course Generator */}
      <motion.div
        className="p-4 md:p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold mb-4">Generate New Course</h2>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Course Generator Controls */}
          <div className="w-full lg:w-2/5 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 md:p-6">
            <div className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  What do you want to learn?
                </label>
                <div className="relative gap-2">
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-lg border text-sm ${
                      titleError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700`}
                    placeholder="e.g., Machine Learning for Beginners"
                    value={courseTitle}
                    onChange={e => {
                      setCourseTitle(e.target.value);
                      if (e.target.value.trim()) setTitleError("");
                    }}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Sparkles className="h-5 w-5 text-piper-blue dark:text-piper-cyan" />
                  </div>
                </div>
                {titleError && <p className="mt-1 text-xs text-red-500">{titleError}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">
                    Course Complexity
                  </label>
                  <span className="text-sm text-gray-500">
                    {courseComplexity < 30
                      ? "Beginner"
                      : courseComplexity < 70 ? "Intermediate" : "Advanced"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={courseComplexity}
                    onChange={e =>
                      setCourseComplexity(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-piper-blue dark:[&::-webkit-slider-thumb]:bg-piper-cyan"
                  />
                  <Target className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">
                    Course Duration
                  </label>
                  <span className="text-sm text-gray-500">
                    {courseDuration < 30
                      ? "1-2 hours"
                      : courseDuration < 70 ? "4-6 hours" : "10+ hours"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={courseDuration}
                    onChange={e => setCourseDuration(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-piper-blue dark:[&::-webkit-slider-thumb]:bg-piper-cyan"
                  />
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">
                    Interactivity Level
                  </label>
                  <span className="text-sm text-gray-500">
                    {interactivityLevel < 30
                      ? "Mostly Text"
                      : interactivityLevel < 70
                        ? "Balanced"
                        : "Highly Interactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={interactivityLevel}
                    onChange={e =>
                      setInteractivityLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-piper-blue dark:[&::-webkit-slider-thumb]:bg-piper-cyan"
                  />
                  <Sliders className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex flex-wrap gap-2 mb-4">
                  <button 
                    className={`px-3 py-1.5 rounded-full ${includeQuizzes 
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'} 
                      text-xs font-medium flex items-center transition-colors`}
                    onClick={() => setIncludeQuizzes(!includeQuizzes)}
                  >
                    {includeQuizzes ? (
                      <Check className="h-3 w-3 mr-1 text-piper-blue dark:text-piper-cyan" />
                    ) : (
                      <span className="h-3 w-3 mr-1" />
                    )}
                    Include quizzes
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-full ${includeInteractive 
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'} 
                      text-xs font-medium flex items-center transition-colors`}
                    onClick={() => setIncludeInteractive(!includeInteractive)}
                  >
                    {includeInteractive ? (
                      <Check className="h-3 w-3 mr-1 text-piper-blue dark:text-piper-cyan" />
                    ) : (
                      <span className="h-3 w-3 mr-1" />
                    )}
                    Interactive examples
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-full ${includeCode 
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'} 
                      text-xs font-medium flex items-center transition-colors`}
                    onClick={() => setIncludeCode(!includeCode)}
                  >
                    {includeCode ? (
                      <Check className="h-3 w-3 mr-1 text-piper-blue dark:text-piper-cyan" />
                    ) : (
                      <span className="h-3 w-3 mr-1" />
                    )}
                    Code examples
                  </button>
                </div>

                <button 
                  className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-piper-blue dark:bg-piper-cyan dark:text-piper-darkblue hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/90 transition-colors shadow-md hover:shadow-lg ${
                    isGenerating ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  onClick={handleGenerateCourse}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-5 w-5" />
                      Generate Course
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Course Preview */}
          <div className="w-full lg:w-3/5">
            {isGenerating ? (
              <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-8">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-piper-blue dark:text-piper-cyan mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Generating Your Course</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                    Creating a personalized learning experience based on your preferences...
                  </p>
                </div>
              </div>
            ) : !isGenerated ? (
              <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Course Preview</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  Provide your input and click "Generate Course" to create a personalized learning experience.</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-piper-blue dark:bg-piper-cyan flex items-center justify-center text-white dark:text-piper-darkblue">
                      <BookMarked className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {courseTitle}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {courseDuration < 30
                          ? "1-2 hours"
                          : courseDuration < 70 ? "4-6 hours" : "10+ hours"} • 5 modules • Generated by Piper AI
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(star =>
                      <Star
                        key={star}
                        className="h-4 w-4 fill-piper-blue text-piper-blue dark:fill-piper-cyan dark:text-piper-cyan"
                      />
                    )}
                  </div>    
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-3">
                    {/* Dynamic Module Rendering with Accordion Functionality */}
                    {moduleData.map(module => (
                      <div 
                        key={module.id} 
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                      >
                        <div 
                          className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between cursor-pointer"
                          onClick={() => toggleModule(module.id)}
                        >
                          <div className="flex items-center">
                            <Layers className="h-4 w-4 text-piper-blue mr-2 dark:text-piper-cyan" />
                            <span className="font-medium text-sm">
                              Module {module.id}: {module.title}
                            </span>
                          </div>
                         <ChevronDown className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                                expandedModules[module.id]
                                                ? "rotate-180 text-piper-blue dark:text-piper-cyan"
                                                : ""
                                            }`}
                                            size={20}
                                          />
                        </div>
                        
                        {expandedModules[module.id] && (
                          <div className="p-4 space-y-3">
                            {module.lessons
                              .filter(lesson => {
                                if (lesson.type === 'quiz' && !includeQuizzes) return false;
                                if (lesson.type === 'interactive' && !includeInteractive) return false;
                                if (lesson.type === 'code' && !includeCode) return false;
                                return true;
                              })
                              .map((lesson, idx) => (
                                <div key={idx}>
                                  {renderLesson(lesson)}
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <button 
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white dark:text-piper-darkblue bg-piper-blue dark:bg-piper-cyan hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/90 transition-colors"
                      onClick={handleStartLearning}
                    >
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Start Learning
                    </button>

                    <div className="flex items-center space-x-2">
                      <button 
                        className={`inline-flex items-center justify-center p-2 border ${
                          isBookmarked 
                            ? "border-piper-blue dark:border-piper-cyan bg-piper-blue/10 dark:bg-piper-cyan/10" 
                            : "border-gray-200 dark:border-gray-700"
                        } rounded-md hover:bg-gray-50 dark:hover:bg-gray-700`}
                        onClick={handleBookmark}
                        title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                      >
                        <BookMarked className={`h-4 w-4 ${
                          isBookmarked 
                            ? "text-piper-blue dark:text-piper-cyan" 
                            : ""
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GenerateCourse;
