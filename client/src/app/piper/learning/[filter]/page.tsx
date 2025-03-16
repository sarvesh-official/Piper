"use client";

import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { Filter, Check, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import CourseCard from "@/components/courses/CourseCard";
import axios from "axios";

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
  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter options to display in the menu
  const filterOptions = [
    { id: 'all', label: 'All Courses' },
    { id: 'active', label: 'Active Courses' },
    { id: 'bookmarked', label: 'Bookmarked' },
  ];

  // Set the active filter based on URL params and fetch courses
  useEffect(() => {
    if (params.filter) {
      setActiveFilter(params.filter as string);
    }
    fetchCourses(params.filter as string || 'all');
  }, [params.filter]);

  // Fetch courses from the backend based on filter
  const fetchCourses = async (filter: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/courses?filter=${filter}`);
      setCoursesData(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Apply filter and navigate
  const applyFilter = (filterId: string) => {
    router.push(`/piper/learning/${filterId}`);
    setShowFilterMenu(false);
  };

  // Handle status change for courses (add or remove statuses)
  const handleStatusChange = async (courseId: string, status: CourseStatus, add: boolean) => {
    try {
      // Update UI optimistically
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
      
      // Send update to backend
      await axios.put(`/api/courses/${courseId}/status`, {
        status,
        add
      });
    } catch (err) {
      console.error("Failed to update course status:", err);
      // Revert the optimistic update on error
      fetchCourses(activeFilter);
    }
  };

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
          {loading ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading courses...</p>
          ) : error ? (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          ) : coursesData?.length > 0 ? (
            coursesData.map((course, index) => (
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
