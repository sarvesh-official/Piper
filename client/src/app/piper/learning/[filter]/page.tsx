"use client";

import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { Filter, Check, MoreHorizontal } from "lucide-react";
import { courses as initialCourses } from "@/data/course";
import { useState, useEffect } from "react";
import CourseCard from "@/components/courses/CourseCard";

type CourseStatus = 'active' | 'bookmarked' | 'completed';

// Define the Course interface
interface Course {
  _id: string;
  title: string;
  description: string;
  image?: string;
  progress?: number;
  status?: CourseStatus[];
}

const Dashboard = () => {
  const router = useRouter();
  const params = useParams();
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [coursesData, setCoursesData] = useState<Course[]>(initialCourses);

  // Filter options to display in the menu
  const filterOptions = [
    { id: 'all', label: 'All Courses' },
    { id: 'active', label: 'Active Courses' },
    { id: 'bookmarked', label: 'Bookmarked' },
  ];

  // Set the active filter based on URL params
  useEffect(() => {
    if (params.filter) {
      setActiveFilter(params.filter as string);
    }
  }, [params.filter]);

  // Function to get filtered courses based on active filter
  const getFilteredCourses = (): Course[] => {
    if (!activeFilter || activeFilter === 'all') {
      return coursesData;
    }
    
    return coursesData.filter(course => 
      course.status && Array.isArray(course.status) && 
      course.status.includes(activeFilter as CourseStatus)
    );
  };

  // Apply filter and navigate
  const applyFilter = (filterId: string) => {
    router.push(`/piper/learning/${filterId}`);
    setShowFilterMenu(false);
  };

  // Handle status change for courses (add or remove bookmarked/active status)
  const handleStatusChange = (courseId: string, status: CourseStatus, add: boolean) => {
    setCoursesData(prevCourses => 
      prevCourses.map(course => {
        if (course._id === courseId) {
          let updatedStatus = [...(course.status || [])];
          
          if (add) {
            // Add the status if it doesn't exist
            if (!updatedStatus.includes(status)) {
              updatedStatus.push(status);
            }
          } else {
            // Remove the status
            updatedStatus = updatedStatus.filter(s => s !== status);
          }
          
          return { ...course, status: updatedStatus };
        }
        return course;
      })
    );
  };

  // Get filtered courses
  const filteredCourses = getFilteredCourses();

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-6 h-[85vh]">
      <motion.div
        className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Courses</h2>
          
          <div className="relative z-20">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter size={16} />
              <span className="text-sm">{filterOptions.find(f => f.id === activeFilter)?.label || 'Filter'}</span>
              <MoreHorizontal className="text-gray-600 dark:text-gray-300" size={16} />
            </button>
            
            {showFilterMenu && (
              <motion.div 
                className="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-30 w-48 border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {filterOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => applyFilter(option.id)}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>{option.label}</span>
                    {activeFilter === option.id && (
                      <Check size={16} className="text-piper-blue dark:text-piper-cyan" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 md:pr-2">
          {filteredCourses?.length > 0 ? (
            filteredCourses.map((course, index) => (
              <CourseCard
                key={course._id || index}
                id={course._id || `course-${index}`}
                title={course.title}
                description={course.description}
                image={course.image || ""}
                progress={course.progress}
                status={course.status || []}
                onStatusChange={handleStatusChange}
                index={index}
              />
            ))
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No courses found for the selected filter.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
