"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, AlertTriangle, BookOpen, Check, HelpCircle, Code, Play, Copy, Check as CheckIcon } from 'lucide-react';
import courseApi, { Course, Lesson } from '@/app/api/course/api';
import { toast } from 'react-toastify';
import CourseQuiz from '@/components/piper/CourseQuiz';
import { useAuth } from '@clerk/nextjs';

// Custom toast configuration
const localCustomToast = {
  success: (message: string) => {
    toast.success(message, {
      position: "bottom-right",
      autoClose: 2000,
      style: {
        background: document.documentElement.classList.contains('dark') ? '#020617' : '#ffffff', // bg-piper-cyan : bg-piper-blue
        color: document.documentElement.classList.contains('dark') ? '#22d3ee' : '#1868F2', // text-piper-darkblue : text-primary
        fontWeight: 500,
      }
    });
  },
  error: (message: string) => {
    toast.error(message, {
      position: "bottom-right",
      autoClose: 3000
    });
  }
};

// Improved markdown formatter with better syntax highlighting
const formatMarkdown = (text: string) => {
  if (!text) return '';
  
  return text
    // Code blocks - already handled separately, but handle inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 font-mono text-sm">$1</code>')
    
    // Headers with proper styling
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold my-4 text-gray-900 dark:text-white">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold my-5 text-gray-900 dark:text-white">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-6 text-gray-900 dark:text-white">$1</h1>')
    
    // Bold text with highlighting
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>')
    
    // Italic text
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    
    // Lists with proper styling
    .replace(/^\s*\d+\.\s+(.*$)/gm, '<li class="ml-6 list-decimal mb-1 text-gray-800 dark:text-gray-200">$1</li>')
    .replace(/^\s*\-\s+(.*$)/gm, '<li class="ml-6 list-disc mb-1 text-gray-800 dark:text-gray-200">$1</li>')
    
    // Blockquotes
    .replace(/^\>\s+(.*$)/gm, '<blockquote class="pl-4 italic border-l-4 border-gray-300 dark:border-gray-600 my-3 text-gray-700 dark:text-gray-300">$1</blockquote>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-piper-blue dark:text-piper-cyan hover:underline">$1</a>')
    
    // Paragraphs
    .replace(/\n\s*\n/g, '</p><p class="mb-4 text-gray-800 dark:text-gray-200">')
    
    // Wrap in paragraph if not already
    .replace(/^(.+)$/, '<p class="mb-4 text-gray-800 dark:text-gray-200">$1</p>');
};

// Add utility function for rendering code blocks with syntax highlighting
const renderContentWithCodeBlocks = (content: string) => {
  if (!content) return null;
  
  // Split content by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const code = part.slice(3, -3).trim();
      return (
        <pre key={index} className="bg-gray-800 text-white p-4 rounded-md overflow-auto">
          <code>{code}</code>
        </pre>
      );
    }
    return <div key={index} dangerouslySetInnerHTML={{ __html: formatMarkdown(part) }} />;
  });
};

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = parseInt(params.moduleId as string);
  const lessonId = parseInt(params.lessonId as string);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const {getToken} = useAuth();

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      const token = await getToken()
      try {

        if(!token) return;

        const courseData = await courseApi.getCourse(courseId, token);
        
        // Set default fields for backward compatibility
        const normalizedCourse = {
          ...courseData,
          status: courseData.status || ['active'],
          progress: courseData.progress || 0
        };
        
        setCourse(normalizedCourse);
        
        // Find the specific module and lesson
        const module = normalizedCourse.modules.find(m => m.id === moduleId);
        if (!module || lessonId < 0 || lessonId >= module.lessons.length) {
          throw new Error('Lesson not found');
        }
        
        setCurrentLesson({
          ...module.lessons[lessonId],
          completed: module.lessons[lessonId].completed || false
        });
        
        // Mark the lesson as viewed after a delay (only if not already completed)
        if (!module.lessons[lessonId].completed) {
          const timer = setTimeout(() => {
            markLessonAsComplete();
          }, 10000); // Mark as complete after 10 seconds of viewing
          
          return () => clearTimeout(timer);
        }
        
      } catch (error: any) {
        console.error('Error fetching lesson:', error);
        setError(error.message || 'Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId, moduleId, lessonId]);

  const markLessonAsComplete = async () => {
    if (markingComplete || !course || !currentLesson) return;
    
    setMarkingComplete(true);
    try {
      // Toggle the completion status
      const newStatus = !currentLesson.completed;
      const token = await getToken()
      if(!token) return;

      const updatedCourse = await courseApi.updateLessonCompletion(
        courseId,
        moduleId,
        lessonId,
        newStatus,
        token
      );
      
      setCourse(updatedCourse);
      setCurrentLesson({
        ...currentLesson,
        completed: newStatus
      });
      
      // Use custom toast with theme-appropriate styling
      localCustomToast.success(newStatus ? "Lesson marked as completed" : "Lesson marked as incomplete");
    } catch (error) {
      console.error("Failed to update lesson status", error);
      localCustomToast.error("Failed to update lesson status");
    } finally {
      setMarkingComplete(false);
    }
  };

  const navigateToNextLesson = () => {
    if (!course) return;
    
    const currentModule = course.modules.find(m => m.id === moduleId);
    if (!currentModule) return;
    
    // If there are more lessons in this module
    if (lessonId < currentModule.lessons.length - 1) {
      router.push(`/piper/learning/course/${courseId}/module/${moduleId}/lesson/${lessonId + 1}`);
    } else {
      // Find the next module
      const currentModuleIndex = course.modules.findIndex(m => m.id === moduleId);
      if (currentModuleIndex < course.modules.length - 1) {
        const nextModule = course.modules[currentModuleIndex + 1];
        router.push(`/piper/learning/course/${courseId}/module/${nextModule.id}/lesson/0`);
      }
    }
  };

  const navigateToPreviousLesson = () => {
    if (!course) return;
    
    // If not the first lesson in module
    if (lessonId > 0) {
      router.push(`/piper/learning/course/${courseId}/module/${moduleId}/lesson/${lessonId - 1}`);
    } else {
      // Find the previous module
      const currentModuleIndex = course.modules.findIndex(m => m.id === moduleId);
      if (currentModuleIndex > 0) {
        const prevModule = course.modules[currentModuleIndex - 1];
        const lastLessonIndex = prevModule.lessons.length - 1;
        router.push(`/piper/learning/course/${courseId}/module/${prevModule.id}/lesson/${lastLessonIndex}`);
      }
    }
  };

  const navigateBack = () => {
    router.push(`/piper/learning/course/${courseId}`);
  };

  // Get the appropriate icon and background based on lesson type
  const getLessonTypeInfo = () => {
    if (!currentLesson) return { icon: <BookOpen size={18} />, bg: "bg-blue-100 dark:bg-blue-900" };
    
    switch (currentLesson.type) {
      case 'quiz':
        return { 
          icon: <HelpCircle size={18} className="text-purple-600 dark:text-purple-300" />,
          bg: "bg-purple-100 dark:bg-purple-900"
        };
      case 'code':
        return { 
          icon: <Code size={18} className="text-amber-600 dark:text-amber-300" />,
          bg: "bg-amber-100 dark:bg-amber-900"
        };
      default:
        return { 
          icon: <BookOpen size={18} className="text-blue-600 dark:text-blue-300" />,
          bg: "bg-blue-100 dark:bg-blue-900"
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-piper-blue dark:text-piper-cyan" />
      </div>
    );
  }

  if (error || !currentLesson || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <p className="text-lg text-gray-500 dark:text-gray-400">{error || 'Lesson not found'}</p>
          <button 
            onClick={navigateBack}
            className="mt-4 px-4 py-2 bg-piper-blue text-white rounded-lg hover:bg-blue-600"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  // Get current module for navigation
  const currentModule = course?.modules.find(m => m.id === moduleId);
  const isLastLesson = currentModule && lessonId === currentModule.lessons.length - 1;
  const isLastModule = course && currentModule && 
    course.modules.indexOf(currentModule) === course.modules.length - 1;
  const isFirstLesson = lessonId === 0;
  const isFirstModule = course && currentModule && 
    course.modules.indexOf(currentModule) === 0;

  const { icon, bg } = getLessonTypeInfo();

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Navigation breadcrumb - Improved responsive layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <button 
            onClick={() => router.push(`/piper/learning/course/${courseId}`)}
            className="flex items-center text-piper-blue dark:text-piper-cyan hover:underline"
          >
            <ArrowLeft size={14} className="mr-1 sm:mr-2" />
            Back to Course
          </button>
          <span className="mx-1 sm:mx-2">•</span>
          <span className="hidden sm:inline">{currentModule?.title}</span>
          <span className="hidden sm:inline mx-2">•</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {lessonId + 1}/{currentModule?.lessons.length}
          </span>
        </div>
        
        {currentLesson && (
          <button 
            onClick={markLessonAsComplete}
            disabled={markingComplete}
            className={`flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm
              ${currentLesson.completed
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            {markingComplete ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
            ) : (
              <Check className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${currentLesson.completed ? 'text-green-600 dark:text-green-400' : ''}`} />
            )}
            {currentLesson.completed ? 
              <span className="hidden sm:inline">Mark as Incomplete</span> : 
              <span className="hidden sm:inline">Mark as Complete</span>}
            {currentLesson.completed ? 
              <span className="inline sm:hidden">Incomplete</span> : 
              <span className="inline sm:hidden">Complete</span>}
          </button>
        )}
      </div>

      {/* Lesson title and content - Improved responsive layout */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden mb-4 sm:mb-6">
        <div className="p-3 sm:p-6">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-0 mb-3 sm:mb-4">
            <div className={`p-1.5 sm:p-2 ${bg} rounded-full mr-2 sm:mr-3 flex-shrink-0`}>
              {icon}
            </div>
            <h1 className="text-base sm:text-xl font-bold line-clamp-2 flex-1">{currentLesson?.title}</h1>
          </div>

          <div className="prose prose-blue dark:prose-invert max-w-none">
            {currentLesson?.type === 'quiz' ? (
              // Render quiz component for quiz type lessons
              <CourseQuiz 
                quizContent={currentLesson.content || ''}
                courseId={courseId}
              />
            ) : (
              // Use custom rendering logic for content with code blocks
              <div className="markdown-content">
                {currentLesson?.content ? (
                  renderContentWithCodeBlocks(currentLesson.content)
                ) : (
                  <p>No content available for this lesson.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation buttons - Updated for better responsiveness */}
      <div className="flex justify-between gap-2">
        <button
          onClick={navigateToPreviousLesson}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 flex items-center rounded-lg text-xs sm:text-sm ${
            isFirstLesson && isFirstModule
              ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-piper-blue dark:bg-piper-cyan text-white dark:text-piper-darkblue hover:bg-blue-600 dark:hover:bg-cyan-400'
          }`}
          disabled={isFirstLesson && isFirstModule}
        >
          <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Previous Lesson</span>
          <span className="inline sm:hidden">Previous</span>
        </button>

        <button
          onClick={navigateToNextLesson}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 flex items-center rounded-lg text-xs sm:text-sm ${
            isLastLesson && isLastModule
              ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-piper-blue dark:bg-piper-cyan text-white dark:text-piper-darkblue hover:bg-blue-600 dark:hover:bg-cyan-400'
          }`}
          disabled={isLastLesson && isLastModule}
        >
          <span className="hidden sm:inline">Next Lesson</span>
          <span className="inline sm:hidden">Next</span>
          <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  );
}
