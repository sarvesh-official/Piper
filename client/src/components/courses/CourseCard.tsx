import React, { useState } from 'react';
import { MoreHorizontal, Bookmark, Play, Check, ExternalLink, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

type CourseStatus = 'active' | 'bookmarked' | 'completed';

interface CourseProps {
  id: string;
  title: string;
  description: string;
  image: string;
  progress?: number;
  status: CourseStatus[];
  onStatusChange: (id: string, status: CourseStatus, add: boolean) => void;
  index?: number;  // Add this line
}

const CourseCard: React.FC<CourseProps> = ({
  id,
  title,
  description,
  image,
  progress = 0,
  status,
  onStatusChange,
  index = 0,  // Add this line
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking the menu
    setShowMenu(!showMenu);
  };
  
  const toggleStatus = (statusType: CourseStatus, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking status buttons
    const hasStatus = status.includes(statusType);
    onStatusChange(id, statusType, !hasStatus);
    setShowMenu(false); // Close menu after action
  };

  return (
    <motion.div
      className="relative cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-gray-800 p-4 hover:shadow-lg transition-all min-h-[200px] flex flex-col w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={`/piper/learning/course/${id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View course details</span>
      </Link>
      
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white pr-16">{title}</h2>
        
        <div className="flex items-center gap-2 z-20">
          <button
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 z-20"
            onClick={(e) => {
              e.stopPropagation();
              // This is just for visual effect, the Link above will handle navigation
            }}
          >
            <ArrowRight size={16} />
          </button>
          
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300"
            >
              <MoreHorizontal className="text-gray-600 dark:text-gray-300" size={16} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-30 w-48 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={(e) => toggleStatus('active', e)}
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Play size={16} className={`mr-2 ${status.includes('active') ? 'text-piper-blue dark:text-piper-cyan' : 'text-gray-500 dark:text-gray-400'}`} />
                  {status.includes('active') ? 'Remove from Active' : 'Add to Active'}
                </button>
                
                <button
                  onClick={(e) => toggleStatus('bookmarked', e)}
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Bookmark size={16} className={`mr-2 ${status.includes('bookmarked') ? 'text-piper-blue dark:text-piper-cyan' : 'text-gray-500 dark:text-gray-400'}`} />
                  {status.includes('bookmarked') ? 'Remove Bookmark' : 'Bookmark'}
                </button>
                
                <button
                  onClick={(e) => toggleStatus('completed', e)}
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Check size={16} className={`mr-2 ${status.includes('completed') ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`} />
                  {status.includes('completed') ? 'Mark as Incomplete' : 'Mark as Complete'}
                </button>
                
                <Link 
                  href={`/piper/learning/course/${id}`}
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                  View Course Details
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-grow">
        {description}
      </p>
      
      <div className="flex flex-wrap gap-2 mt-2 mb-4">
        {status.includes('active') && (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
            Active
          </span>
        )}
        {status.includes('bookmarked') && (
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
            Bookmarked
          </span>
        )}
        {status.includes('completed') && (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
            Completed
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2 mt-auto">
        <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-600">
          <div 
            className="h-full rounded-full bg-piper-blue dark:bg-piper-cyan" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs font-medium min-w-[40px] text-right">{progress}%</p>
      </div>
    </motion.div>
  );
};

export default CourseCard;
