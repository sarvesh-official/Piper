"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
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
  Loader2,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";

// Import the roadmap API
import roadmapApi, { 
  Roadmap,
  RoadmapModule, 
  RoadmapLesson 
} from "@/app/api/roadmap/api";
import courseApi from "@/app/api/course/api";
import { useAuth } from "@clerk/nextjs";

const GenerateCourse = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Course generator state
  const [courseComplexity, setCourseComplexity] = useState(50);
  const [courseDuration, setCourseDuration] = useState(60);
  const [interactivityLevel, setInteractivityLevel] = useState(70);
  const [courseTitle, setCourseTitle] = useState(
    ""
  );
  
  // Options state
  const [includeQuizzes, setIncludeQuizzes] = useState(true);
  const [includeCode, setIncludeCode] = useState(true);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [roadmapId, setRoadmapId] = useState("");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  
  // Error state
  const [titleError, setTitleError] = useState("");
  const {getToken} = useAuth();
  // Module accordion state - default expanded for first module
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 1: true });
  
  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Check if we're editing an existing roadmap
  useEffect(() => {
    const existingRoadmapId = searchParams.get('roadmapId');
    if (existingRoadmapId) {
      fetchExistingRoadmap(existingRoadmapId);
    }
  }, [searchParams]);

  const fetchExistingRoadmap = async (roadmapId: string) => {
    setIsGenerating(true);
    try {
      const roadmapData = await roadmapApi.getRoadmap(roadmapId);
      setRoadmap(roadmapData);
      setRoadmapId(roadmapData._id);
      setCourseTitle(roadmapData.title);
      setCourseComplexity(roadmapData.complexity);
      setCourseDuration(roadmapData.duration);
      setInteractivityLevel(roadmapData.interactivity);
      setIncludeQuizzes(roadmapData.includeQuizzes);
      setIncludeCode(roadmapData.includeCode);
      setIsGenerated(true);
    } catch (error: any) {
      console.error("Error fetching roadmap:", error);
      toast.error("Failed to load roadmap");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Toggle module expansion
  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleGenerateRoadmap = async () => {
    // Validate input
    if (!courseTitle.trim()) {
      setTitleError("Please enter a course title");
      return;
    }
    setTitleError("");
    
    // Start generation
    setIsGenerating(true);
    
    try {
      // Generate roadmap first using the roadmap API - ensure this is used correctly
      const generatedRoadmap = await roadmapApi.generateRoadmap({
        title: courseTitle,
        complexity: courseComplexity,
        duration: courseDuration,
        includeQuizzes,
        includeCode
      });
      
      setRoadmap(generatedRoadmap);
      setRoadmapId(generatedRoadmap._id);
      setIsGenerated(true);
      
      toast.success("Course roadmap generated successfully!");
    } catch (error: any) {
      console.error("Error generating roadmap:", error);
      toast.error(error.message || "Failed to generate course roadmap");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleRegenerateRoadmap = async () => {
    if (!roadmapId) return;
    
    setIsRegenerating(true);
    
    try {
      const regeneratedRoadmap = await roadmapApi.regenerateRoadmap(roadmapId, {
        title: courseTitle,
        complexity: courseComplexity,
        duration: courseDuration,
        includeQuizzes,
        includeCode
      });
      
      setRoadmap(regeneratedRoadmap);
      
      toast.success("Course roadmap regenerated successfully!");
    } catch (error: any) {
      console.error("Error regenerating roadmap:", error);
      toast.error(error.message || "Failed to regenerate course roadmap");
    } finally {
      setIsRegenerating(false);
    }
  };
  
  const handleStartLearning = async () => {
    if (!roadmapId) return;
    
    setIsCreatingCourse(true);
    
    try {

      const token = await getToken()
      if (!token) {
        throw new Error("User not authenticated");
      }
      // Create detailed course from roadmap using courseApi
      const course = await courseApi.createCourseFromRoadmap(roadmapId, token);
      
      toast.success("Full course created successfully!");
      
      // Navigate to the course page
      router.push(`/piper/learning/course/${course._id}`);
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast.error(error.message || "Failed to create detailed course");
      setIsCreatingCourse(false);
    }
  };

  const handleBookmark = () => {
    // Toggle bookmark state for visual feedback
    setIsBookmarked(prev => !prev);
    
    // Show toast notification
    toast.success(isBookmarked ? "Roadmap removed from bookmarks" : "Roadmap added to bookmarks");
    
    // Here you would typically also save this to user's bookmarks in a database
  };

  // Render a lesson based on its type
  const renderLesson = (lesson: RoadmapLesson) => {
    // Skip rendering based on user options
    if (lesson.type === 'code' && !includeCode) return null;
    if (lesson.type === 'quiz' && !includeQuizzes) return null;
    
    let icon;
    let iconWrapperClass = "w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center";
    let titleClass = "text-sm";
    
    switch(lesson.type) {
      case 'lesson':
        icon = <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
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
      <div className="flex flex-col space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={iconWrapperClass}>
              {icon}
            </div>
            <span className={titleClass}>
              {lesson.type === 'code' && 'Code Example: '}
              {lesson.title}
            </span>
          </div>
          <span className="text-xs text-gray-500">{lesson.duration}</span>
        </div>
        {lesson.description && (
          <div className="pl-10 text-xs text-gray-500 dark:text-gray-400">
            {lesson.description}
          </div>
        )}
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
        <h2 className="text-lg font-semibold mb-4">Generate Course Roadmap</h2>

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

              {/* Range sliders - unchanged */}
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
                  {/* Option toggles - update to remove interactive options */}
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
                  onClick={handleGenerateRoadmap}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Roadmap...
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-5 w-5" />
                      Generate Roadmap
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Roadmap Preview - Set fixed height */}
          <div className="w-full lg:w-3/5 h-[480px]">
            {isGenerating ? (
              <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-8">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-piper-blue dark:text-piper-cyan mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Generating Your Course Roadmap</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                    Creating a personalized learning plan based on your preferences...
                  </p>
                </div>
              </div>
            ) : !isGenerated ? (
              <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Course Roadmap Preview</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                    Provide your input and click "Generate Roadmap" to create a personalized learning plan.
                  </p>
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
                        {roadmap?.title || courseTitle}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {courseDuration < 30
                          ? "1-2 hours"
                          : courseDuration < 70 ? "4-6 hours" : "10+ hours"} • {roadmap?.modules.length || 0} modules • Generated by Piper AI
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
                  {/* Info box to explain the roadmap-to-course process */}
                  <div className="mb-4 p-3 border border-piper-blue/20 dark:border-piper-cyan/20 bg-piper-blue/5 dark:bg-piper-cyan/5 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-piper-blue dark:text-piper-cyan mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        This is your course roadmap. Review the modules and lessons below. When you're ready to start learning with detailed content, click "Create Full Course".
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Dynamic Module Rendering with Accordion Functionality */}
                    {roadmap?.modules.map((module) => (
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
                          <ChevronDown className={`ml-auto w-5 h-5 transition-transform duration-200 ${
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
                </div>

                {/* Fixed footer with actions */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-center">
                    <div className="space-x-2">
                      <button 
                        className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white dark:text-piper-darkblue bg-piper-blue dark:bg-piper-cyan hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/90 transition-colors ${
                          isCreatingCourse ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                        onClick={handleStartLearning}
                        disabled={isCreatingCourse}
                      >
                        {isCreatingCourse ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Course...
                          </>
                        ) : (
                          <>
                            <GraduationCap className="mr-2 h-4 w-4" />
                            Create Full Course
                          </>
                        )}
                      </button>
                      
                      <button 
                        className={`inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                          isRegenerating ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                        onClick={handleRegenerateRoadmap}
                        disabled={isRegenerating}
                      >
                        {isRegenerating ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Regenerate
                      </button>
                    </div>

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
