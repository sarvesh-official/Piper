
const DashboardSkeleton = () => {
  return (
    <div className="flex rounded-md flex-col md:flex-row bg-piper-blue dark:bg-piper-cyan w-full flex-1 max-w-7xl mx-auto border-2 border-piper-blue/80 dark:border-piper-cyan/80 overflow-hidden h-[80vh]">
    {/* Left Section - User Info & Quick Actions */}
    <div className="p-4 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-piper-darkblue flex flex-col gap-4 flex-1 w-full h-full">
      {/* Greeting & User Profile */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome Back, <span className="text-piper-blue dark:text-piper-cyan">User!</span>
        </h1>
        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
      </div>

      {/* Quick Access - RAG & Course Generation */}
      <div className="grid grid-cols-2 gap-2">
    
          <div  className="h-20 flex items-center justify-center text-lg font-semibold text-white rounded-lg bg-gray-100 dark:bg-gray-700 shadow-md hover:scale-[1.02] transition">
            
          </div>
          <div  className="h-20 flex items-center justify-center text-lg font-semibold text-white rounded-lg bg-gray-100 dark:bg-gray-700 shadow-md hover:scale-[1.02] transition">
            
          </div>
        
      </div>

      {/* Recent Activity */}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        <div className="h-12 w-full rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse"></div>
        <div className="h-12 w-full rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse"></div>
      </div>

      {/* Learning Progress */}
      <div className="flex flex-col gap-2 flex-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Progress</h2>
        <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse"></div>
      </div>
    </div>
  </div>
  )
}

export default DashboardSkeleton