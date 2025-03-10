"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, HelpCircle, Code, Check, Play } from 'lucide-react';

type LessonType = 'content' | 'quiz' | 'exercise';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: LessonType;
  completed: boolean;
  content?: string; // Added content field for lessons
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  progress?: number;
  status: ('active' | 'bookmarked' | 'completed')[];
  content?: string;
  modules: Module[];
}

// Mock lesson content data - in a real application, this would come from an API
const LESSON_CONTENT: Record<string, string> = {
  '1': 'This is an introduction to web development. Web development is the process of building and maintaining websites. It includes aspects such as web design, web publishing, web programming, and database management.',
  '2': 'Core concepts in web development include HTML for structure, CSS for styling, and JavaScript for interactivity. These three languages are the backbone of most websites.',
  '3': 'This is a quiz to test your knowledge on the fundamentals of web development.',
  '4': 'In practical applications, we use various frameworks and libraries to make development faster and more efficient. Popular frameworks include React, Angular, and Vue.',
  '5': 'Complete this hands-on exercise to practice the concepts learned.',
  '6': 'Advanced techniques include performance optimization, accessibility, and responsive design.',
  '7': 'For your final project, you will build a complete website from scratch using all the concepts learned in this course.',
  '8': 'The final assessment will test your knowledge of all concepts covered in this course.',
};

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
        lessons: [
          { id: '4', title: 'Practical Applications', duration: '30 min', type: 'content', completed: false },
          { id: '5', title: 'Hands-on Exercise', duration: '20 min', type: 'exercise', completed: false }
        ]
      },
      {
        id: 'mod3',
        title: 'Advanced Topics',
        description: 'Master complex techniques and implementations',
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
        lessons: [
          { id: '4', title: 'Promises', duration: '40 min', type: 'content', completed: false },
          { id: '5', title: 'Async/Await', duration: '35 min', type: 'content', completed: false },
          { id: '6', title: 'Coding Challenge', duration: '45 min', type: 'exercise', completed: false }
        ]
      }
    ]
  }
];

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;
  
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    
    // Find the course with the matching ID
    const foundCourse = COURSES.find(c => c.id === courseId);
    
    if (foundCourse) {
      setCourse(foundCourse);
      
      // Find the module with the matching ID
      const foundModule = foundCourse.modules.find(m => m.id === moduleId);
      if (foundModule) {
        setModule(foundModule);
        
        // Find the lesson with the matching ID
        const foundLesson = foundModule.lessons.find(l => l.id === lessonId);
        if (foundLesson) {
          // Add content to the lesson from our mock data
          setLesson({
            ...foundLesson,
            content: LESSON_CONTENT[foundLesson.id] || 'No content available for this lesson.'
          });
        }
      }
    }
    
    setLoading(false);
  }, [courseId, moduleId, lessonId]);

  const navigateToModule = () => {
    router.push(`/piper/learning/course/${courseId}/module/${moduleId}`);
  };

  // Function to get the next and previous lessons
  const getAdjacentLessons = () => {
    if (!module) return { prevLesson: null, nextLesson: null };
    
    const currentLessonIndex = module.lessons.findIndex(l => l.id === lessonId);
    const prevLesson = currentLessonIndex > 0 ? module.lessons[currentLessonIndex - 1] : null;
    const nextLesson = currentLessonIndex < module.lessons.length - 1 ? module.lessons[currentLessonIndex + 1] : null;
    
    return { prevLesson, nextLesson };
  };

  const { prevLesson, nextLesson } = getAdjacentLessons();

  const navigateToLesson = (id: string) => {
    router.push(`/piper/learning/course/${courseId}/module/${moduleId}/lesson/${id}`);
  };

  const markAsCompleted = () => {
    // In a real application, you would call an API to update the lesson status
    // Here we're just showing how the UI would change
    if (lesson) {
      setLesson({
        ...lesson,
        completed: true
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-piper-blue"></div>
      </div>
    );
  }

  if (!course || !module || !lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-lg text-gray-500 dark:text-gray-400">Lesson not found</p>
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

  // Determine lesson icon and background color based on lesson type
  const getLessonIcon = () => {
    switch (lesson.type) {
      case 'quiz':
        return <HelpCircle size={20} />;
      case 'exercise':
        return <Code size={20} />;
      default:
        return <BookOpen size={20} />;
    }
  };

  let iconBg = "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
  if (lesson.type === 'quiz') {
    iconBg = "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
  } else if (lesson.type === 'exercise') {
    iconBg = "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200";
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={navigateToModule}
        className="flex items-center text-piper-blue dark:text-piper-cyan mb-6"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Module
      </button>

      {/* Lesson Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className={`${iconBg} p-2.5 rounded-full mr-3`}>
            {getLessonIcon()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lesson.title}</h1>
            <p className="text-gray-600 dark:text-gray-300">
              {module.title} • {lesson.duration}
            </p>
          </div>
        </div>
        
        {/* Lesson Content */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-100 dark:border-gray-700 mb-6">
          {/* Different content based on lesson type */}
          {lesson.type === 'content' && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{lesson.content}</p>
            </div>
          )}
          
          {lesson.type === 'quiz' && (
            <div>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-6">{lesson.content}</p>
              <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Quiz Questions</h3>
                <p className="text-purple-700 dark:text-purple-300">Answer the following questions to test your knowledge.</p>
                {/* Quiz questions would go here in a real implementation */}
                <div className="mt-4 p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <p className="font-medium text-purple-800 dark:text-purple-300">Sample Question: What is HTML?</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input type="radio" id="q1a1" name="q1" className="mr-2" />
                      <label htmlFor="q1a1" className="text-gray-700 dark:text-gray-300">HyperText Markup Language</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="q1a2" name="q1" className="mr-2" />
                      <label htmlFor="q1a2" className="text-gray-700 dark:text-gray-300">High-Level Text Management Language</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {lesson.type === 'exercise' && (
            <div>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-6">{lesson.content}</p>
              <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg">
                <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Exercise Instructions</h3>
                <p className="text-amber-700 dark:text-amber-300">Follow these steps to complete the exercise.</p>
                <div className="mt-4 p-3 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Create a new HTML file</li>
                    <li>Add basic HTML structure</li>
                    <li>Implement the specified features</li>
                    <li>Submit your work for review</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Lesson Actions */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {prevLesson && (
              <button
                onClick={() => navigateToLesson(prevLesson.id)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center"
              >
                <ArrowLeft size={16} className="mr-2" />
                Previous
              </button>
            )}
            
            {nextLesson && (
              <button
                onClick={() => navigateToLesson(nextLesson.id)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center"
              >
                Next
                <ArrowRight size={16} className="ml-2" />
              </button>
            )}
          </div>
          
          {lesson.completed ? (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <Check size={18} className="mr-2" />
              Completed
            </div>
          ) : (
            <button
              onClick={markAsCompleted}
              className="px-4 py-2 bg-piper-blue text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
            >
              <Check size={16} className="mr-2" />
              Mark as Completed
            </button>
          )}
        </div>
      </div>
      
      {/* Module Progress */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Module Progress</h2>
        
        <div className="space-y-3">
          {module.lessons.map((moduleLesson) => (
            <div 
              key={moduleLesson.id}
              className={`flex items-center p-3 rounded-md cursor-pointer ${
                moduleLesson.id === lessonId 
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-piper-blue dark:border-piper-cyan' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => navigateToLesson(moduleLesson.id)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                moduleLesson.completed 
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}>
                {moduleLesson.completed ? (
                  <Check size={16} />
                ) : (
                  <Play size={16} />
                )}
              </div>
              <div>
                <p className={`font-medium ${
                  moduleLesson.id === lessonId 
                    ? 'text-piper-blue dark:text-piper-cyan' 
                    : 'text-gray-800 dark:text-gray-200'
                }`}>
                  {moduleLesson.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{moduleLesson.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
