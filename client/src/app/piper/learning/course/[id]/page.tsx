"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, Play, Check, Clock, BookOpen, HelpCircle, Code, Loader2, AlertCircle } from 'lucide-react';
import courseApi, { Course } from '@/app/api/course/api';
import { toast } from 'react-toastify';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [navigatingToLesson, setNavigatingToLesson] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const fetchedCourse = await courseApi.getCourse(id);
        
        // Set default fields if they don't exist in older courses
        const normalizedCourse = {
          ...fetchedCourse,
          status: fetchedCourse.status || ['active'],
          progress: fetchedCourse.progress || 0,
          description: fetchedCourse.description || ''
        };
        
        // Normalize lessons to ensure all have required properties
        normalizedCourse.modules = normalizedCourse.modules.map(module => ({
          ...module,
          lessons: module.lessons.map(lesson => ({
            ...lesson,
            completed: lesson.completed || false,
            type: lesson.type || 'lesson'
          }))
        }));
        
        setCourse(normalizedCourse);
        
        // Set the first module as selected by default if available
        if (normalizedCourse.modules && normalizedCourse.modules.length > 0) {
          setSelectedModuleId(normalizedCourse.modules[0].id);
        }
      } catch (error: any) {
        console.error('Error fetching course:', error);
        setError(error.message || 'Failed to load course. You may not have access to this course.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [id]);

  const handleStartLesson = (moduleId: number, lessonIndex: number) => {
    setNavigatingToLesson(`${moduleId}-${lessonIndex}`);
    router.push(`/piper/learning/course/${id}/module/${moduleId}/lesson/${lessonIndex}`);
  };

  const handleModuleSelect = (moduleId: number) => {
    setSelectedModuleId(moduleId);
  };

  // Toggle lesson completion status
  const toggleLessonCompletion = async (moduleId: number, lessonIndex: number, currentStatus: boolean) => {
    try {
      const updatedCourse = await courseApi.updateLessonCompletion(
        id, 
        moduleId, 
        lessonIndex, 
        !currentStatus
      );
      
      setCourse(updatedCourse);
      toast.success(
        currentStatus ? "Lesson marked as incomplete" : "Lesson marked as complete"
      );
    } catch (error) {
      console.error("Failed to update lesson status", error);
      toast.error("Failed to update lesson status");
    }
  };

  // Toggle course bookmark status
  const toggleBookmark = async () => {
    if (!course) return;
    
    const isCurrentlyBookmarked = course.status.includes('bookmarked');
    
    try {
      const updatedCourse = await courseApi.updateCourseStatus(
        id,
        'bookmarked',
        !isCurrentlyBookmarked
      );
      
      setCourse(updatedCourse);
      toast.success(
        isCurrentlyBookmarked ? "Removed from bookmarks" : "Added to bookmarks"
      );
    } catch (error) {
      console.error("Failed to update bookmark status", error);
      toast.error("Failed to update bookmark status");
    }
  };

  // Find the currently selected module
  const selectedModule = course?.modules.find(module => module.id === selectedModuleId);
  
  // Handle loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-piper-blue dark:text-piper-cyan" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <p className="text-lg text-gray-500 dark:text-gray-400">{error || 'Course not found'}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-piper-blue text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Calculate completed lessons count for progress display
  const totalLessons = course.modules.reduce((count, module) => count + module.lessons.length, 0);
  const completedLessons = course.modules.reduce((count, module) => 
    count + module.lessons.filter(lesson => lesson.completed).length, 0);
  const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Calculate total course duration
  const totalDuration = course.modules.reduce((total, module) => {
    return total + module.lessons.reduce((moduleTotal, lesson) => {
      const minutes = parseInt((lesson.duration || "0").split(' ')[0]);
      return moduleTotal + (isNaN(minutes) ? 0 : minutes);
    }, 0);
  }, 0);
  
  // Format total duration into hours and minutes
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  const formattedDuration = hours > 0 
    ? `${hours} hr ${minutes > 0 ? `${minutes} min` : ''}` 
    : `${minutes} min`;

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-piper-blue dark:text-piper-cyan mb-6"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Dashboard
      </button>

      {/* SECTION 1: Top section with course info and progress - as separate card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col gap-4">
            {/* Course title and badges */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
              <div className="flex space-x-2">
                {course.status.includes('active') && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full flex items-center">
                    <Play size={12} className="mr-1" />
                    Active
                  </span>
                )}
                {course.status.includes('bookmarked') && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full flex items-center">
                    <Bookmark size={12} className="mr-1" />
                    Bookmarked
                  </span>
                )}
                {course.status.includes('completed') && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full flex items-center">
                    <Check size={12} className="mr-1" />
                    Completed
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300">{course.description || 'Learn through this interactive course designed to help you master the topic.'}</p>
            
            {/* Course duration */}
            <div className="flex items-center">
              <Clock size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Total duration: {formattedDuration}</span>
            </div>

            {/* Course Progress */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-2 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mr-3">
                    <BookOpen size={18} className="text-blue-600 dark:text-blue-300" />
                  </div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Course Progress</span>
                </div>
                <span className="text-lg font-semibold text-piper-blue dark:text-piper-cyan">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-piper-blue dark:bg-piper-cyan h-3 rounded-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
                <span>
                  {completionPercentage}% content completed
                </span>
                <span>
                  {completedLessons}/{totalLessons} lessons
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex space-x-2 mt-1">
              <button 
                onClick={toggleBookmark}
                className={`flex items-center px-3 py-1 rounded text-xs font-medium ${
                  course.status.includes('bookmarked')
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Bookmark className="h-3 w-3 mr-1" />
                {course.status.includes('bookmarked') ? 'Bookmarked' : 'Bookmark'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Container for sections 2 & 3 using grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* SECTION 2: Left Sidebar - Module List - as separate card */}
        <div className="md:col-span-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg ">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Modules</h2>
            <div className="space-y-2 max-h-[300px] sm:max-h-[350px] md:max-h-[500px] overflow-y-auto pr-2">
              {course.modules.map(module => (
                <div 
                  key={module.id}
                  onClick={() => handleModuleSelect(module.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors
                    ${selectedModuleId === module.id 
                      ? 'bg-piper-blue dark:bg-piper-cyan dark:text-piper-darkblue text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                    }`}
                >
                  <h3 className="font-medium">{module.title}</h3>
                  <p className={`text-sm mt-1 ${selectedModuleId === module.id ? 'text-blue-100 dark:text-piper-darkblue' : 'text-gray-500 dark:text-gray-400'}`}>
                    {module.lessons.length} lessons
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3 bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 sm:p-6">
            {selectedModule && (
              <>
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-1">{selectedModule.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {selectedModule.lessons.length} lessons in this module
                  </p>
                </div>

                {/* Updated lessons with scrolling */}
                <div className="space-y-4 max-h-[350px] sm:max-h-[400px] md:max-h-[500px] overflow-y-auto pr-2">
                  {selectedModule.lessons.map((lesson, index) => {
                    const getLessonIcon = () => {
                      switch (lesson.type) {
                        case 'quiz':
                          return <HelpCircle size={16} className="sm:size-18" />;
                        case 'code':
                          return <Code size={16} className="sm:size-18" />;
                        default:
                          return <BookOpen size={16} className="sm:size-18" />;
                      }
                    };

                    let typeBadgeClass = "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
                    let iconBg = "bg-blue-100 dark:bg-blue-900";

                    switch (lesson.type) {
                      case 'quiz':
                        typeBadgeClass = "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
                        iconBg = "bg-purple-100 dark:bg-purple-900";
                        break;
                      case 'code':
                        typeBadgeClass = "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200";
                        iconBg = "bg-amber-100 dark:bg-amber-900";
                        break;
                    }

                    const isCompleted = lesson.completed || false;
                    const lessonKey = `${selectedModule.id}-${index}`;
                    const isNavigating = navigatingToLesson === lessonKey;

                    return (
                      <div
                        key={index}
                        className={`p-3 sm:p-4 rounded-lg border ${
                          isCompleted
                            ? 'border-green-300 dark:border-green-700'
                            : 'border-gray-200 dark:border-gray-700'
                        } bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                          <div className="flex items-center">
                            <div className={`${iconBg} p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3`}>
                              {getLessonIcon()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{lesson.title}</h3>
                              <div className="flex items-center mt-0.5 sm:mt-1">
                                <Clock size={11} className="text-gray-500 dark:text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">{lesson.duration}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                            <span className={`px-2 py-0.5 sm:py-1 ${typeBadgeClass} text-xs rounded-full`}>
                              {lesson.type === 'lesson' && 'Learning Content'}
                              {lesson.type === 'quiz' && 'Quiz'}
                              {lesson.type === 'code' && 'Code Example'}
                            </span>
                            
                            <div className="flex gap-2 items-center">
                              {isCompleted && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLessonCompletion(selectedModule.id, index, isCompleted);
                                  }}
                                  className="flex items-center text-green-600 dark:text-green-400 text-xs"
                                  title="Mark as incomplete"
                                >
                                  <Check size={14} className="mr-1" />
                                  <span className="hidden sm:inline">Completed</span>
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleStartLesson(selectedModule.id, index)}
                                className={`px-2 sm:px-3 py-1 ${
                                  isCompleted 
                                    ? 'bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600' 
                                    : 'bg-piper-blue dark:bg-piper-cyan hover:bg-blue-600 dark:hover:bg-piper-cyan/90'
                                } text-white dark:text-white rounded-md transition-colors text-xs sm:text-sm flex items-center whitespace-nowrap`}
                                disabled={isNavigating}
                              >
                                {isNavigating ? (
                                  <>
                                    <Loader2 size={12} className="mr-1 animate-spin" />
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <Play size={12} className="mr-1" />
                                    {isCompleted ? "Revisit" : "Start"}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Preview of lesson content */}
                        {lesson.content && (
                          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2 line-clamp-2">
                            {lesson.content
                              .replace(/#+\s/g, '')  // Remove markdown headers
                              .replace(/\*\*/g, '')  // Remove bold markers
                              .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
                              .replace(/!\[.*?\]\(.*?\)/g, '')  // Remove images
                              .replace(/\[.*?\]\(.*?\)/g, '')  // Remove links
                              .replace(/[*_~]/g, '')  // Remove other markdown symbols
                            }
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
