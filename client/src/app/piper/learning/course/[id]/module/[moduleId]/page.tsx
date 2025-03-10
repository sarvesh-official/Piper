"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, Play, Check, Clock, BookOpen, HelpCircle, Code } from 'lucide-react';

type CourseStatus = 'active' | 'bookmarked' | 'completed';
type LessonType = 'content' | 'quiz' | 'exercise';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: LessonType;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  content?: string; // Added optional content field for modules
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  progress?: number;
  status: CourseStatus[];
  content?: string;
  modules: Module[];
}

// Array of all available courses (same as in the course page)
const COURSES: CourseDetail[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.',
    progress: 45,
    status: ['active'],
    content: 'This course covers various web development topics and concepts...',
    modules: [
      {
        id: 'mod1',
        title: 'Fundamentals',
        description: 'Learn the basic concepts and get started',
        content: 'This module covers the fundamental concepts of web development. You will learn about HTML structure, CSS styling basics, and introduction to JavaScript programming.',
        lessons: [
          { id: '1', title: 'Introduction', duration: '15 min', type: 'content', completed: true },
          { id: '2', title: 'Core Concepts', duration: '45 min', type: 'content', completed: true },
          { id: '3', title: 'Knowledge Check', duration: '10 min', type: 'quiz', completed: false }
        ]
      },
      {
        id: 'mod2',
        title: 'Intermediate Skills',
        description: 'Build upon the basics with more advanced topics',
        content: 'In this module, you will learn intermediate web development skills including responsive design, CSS frameworks, and DOM manipulation with JavaScript.',
        lessons: [
          { id: '4', title: 'Practical Applications', duration: '30 min', type: 'content', completed: false },
          { id: '5', title: 'Hands-on Exercise', duration: '20 min', type: 'exercise', completed: false }
        ]
      },
      {
        id: 'mod3',
        title: 'Advanced Topics',
        description: 'Master complex techniques and implementations',
        content: 'The advanced module covers complex web development topics including performance optimization, advanced JavaScript patterns, and modern web APIs.',
        lessons: [
          { id: '6', title: 'Advanced Techniques', duration: '60 min', type: 'content', completed: false },
          { id: '7', title: 'Final Project', duration: '120 min', type: 'exercise', completed: false },
          { id: '8', title: 'Final Assessment', duration: '30 min', type: 'quiz', completed: false }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Advanced JavaScript',
    description: 'Deepen your JavaScript knowledge with advanced patterns and practices.',
    progress: 25,
    status: ['bookmarked'],
    content: 'This course explores advanced JavaScript concepts...',
    modules: [
      {
        id: 'mod1',
        title: 'Modern JavaScript',
        description: 'ES6+ features and modern syntax',
        content: 'Explore modern JavaScript features introduced in ES6 and beyond, including arrow functions, template literals, destructuring, and more.',
        lessons: [
          { id: '1', title: 'Arrow Functions', duration: '20 min', type: 'content', completed: true },
          { id: '2', title: 'Destructuring', duration: '25 min', type: 'content', completed: false },
          { id: '3', title: 'Practice Quiz', duration: '15 min', type: 'quiz', completed: false }
        ]
      },
      {
        id: 'mod2',
        title: 'Async Programming',
        description: 'Working with promises and async/await',
        content: 'Learn asynchronous programming in JavaScript, working with callbacks, promises, and the modern async/await syntax.',
        lessons: [
          { id: '4', title: 'Promises', duration: '40 min', type: 'content', completed: false },
          { id: '5', title: 'Async/Await', duration: '35 min', type: 'content', completed: false },
          { id: '6', title: 'Coding Challenge', duration: '45 min', type: 'exercise', completed: false }
        ]
      }
    ]
  }
];

const ModulePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Find the course with the matching ID
    const foundCourse = COURSES.find(course => course.id === courseId);
    
    if (foundCourse) {
      setCourse(foundCourse);
      
      // Find the module with the matching ID
      const foundModule = foundCourse.modules.find(module => module.id === moduleId);
      if (foundModule) {
        setModule(foundModule);
      }
    }
    
    setLoading(false);
  }, [courseId, moduleId]);

  const handleStartLesson = (lessonId: string) => {
    // Navigate to the specific lesson
    router.push(`/piper/learning/course/${courseId}/module/${moduleId}/lesson/${lessonId}`);
  };

  const navigateBackToCourse = () => {
    router.push(`/piper/learning/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-piper-blue"></div>
      </div>
    );
  }

  if (!course || !module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-lg text-gray-500 dark:text-gray-400">Module not found</p>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={navigateBackToCourse}
        className="flex items-center text-piper-blue dark:text-piper-cyan mb-6"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Course
      </button>

      {/* Module Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{module.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{module.description}</p>
        
        {/* Module content */}
        {module.content && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <p className="text-gray-800 dark:text-gray-200">{module.content}</p>
          </div>
        )}
      </div>

      {/* Module Lessons */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Lessons in this Module</h2>
        
        <div className="space-y-4">
          {module.lessons.map((lesson) => {
            const getLessonIcon = () => {
              switch (lesson.type) {
                case 'quiz':
                  return <HelpCircle size={16} />;
                case 'exercise':
                  return <Code size={16} />;
                default:
                  return <BookOpen size={16} />;
              }
            };

            let typeBadgeClass = "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
            let iconBg = "bg-blue-100 dark:bg-blue-900";

            if (lesson.type === 'quiz') {
              typeBadgeClass = "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
              iconBg = "bg-purple-100 dark:bg-purple-900";
            } else if (lesson.type === 'exercise') {
              typeBadgeClass = "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200";
              iconBg = "bg-amber-100 dark:bg-amber-900";
            }

            return (
              <div
                key={lesson.id}
                className={`p-4 rounded-lg border ${
                  lesson.completed
                    ? 'border-green-300 dark:border-green-700'
                    : 'border-gray-200 dark:border-gray-700'
                } bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`${iconBg} p-2 rounded-full mr-3`}>
                      {getLessonIcon()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{lesson.title}</h3>
                      <div className="flex items-center mt-1">
                        <Clock size={14} className="text-gray-500 dark:text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">{lesson.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 ${typeBadgeClass} text-xs rounded-full`}>
                      {lesson.type === 'content' && 'Learning Content'}
                      {lesson.type === 'quiz' && 'Quiz'}
                      {lesson.type === 'exercise' && 'Exercise'}
                    </span>
                    
                    {lesson.completed ? (
                      <div className="flex items-center gap-3">
                        <span className="flex items-center text-green-600 dark:text-green-400 text-sm">
                          <Check size={14} className="mr-1" />
                          Completed
                        </span>
                        <button
                          onClick={() => handleStartLesson(lesson.id)}
                          className="px-3 py-1 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm flex items-center"
                        >
                          <Play size={14} className="mr-1" />
                          Revisit
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartLesson(lesson.id)}
                        className="px-3 py-1 bg-piper-blue text-white rounded-md hover:bg-blue-600 transition-colors text-sm flex items-center"
                      >
                        <Play size={14} className="mr-1" />
                        Start
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModulePage;
