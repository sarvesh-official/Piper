import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CourseProps {
  id: string;
  title: string;
  description: string;
  progress?: number;
  index?: number;
}

const CourseCard: React.FC<CourseProps> = ({
  id,
  title,
  description,
  progress = 0,
  index = 0,
}) => {
  const [imageError, setImageError] = useState(false);

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
        </div>
      </div>
      
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-grow">
        {description}
      </p>
      
      {/* Progress bar section */}
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
