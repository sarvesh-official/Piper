import { useState } from "react";
import { 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  Sliders, 
  Target, 
  Clock, 
  BarChart, 
  Check,
  Layers,
  FileText,
  ChevronRight,
  ChevronDown,
  Users,
  GraduationCap,
  Award,
  BookMarked,
  Star
} from "lucide-react";

const CourseGenerator = () => {
  const [courseComplexity, setCourseComplexity] = useState(50);
  const [courseDuration, setCourseDuration] = useState(60);
  const [interactivityLevel, setInteractivityLevel] = useState(70);
  
  return (
    <section id="course-generator" className="py-20 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-50">
        <div className="absolute inset-0 bg-gradient-to-r from-piper-blue/10 to-piper-cyan/10" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-piper-blue/10 dark:bg-piper-cyan/20 border border-piper-blue/20 dark:border-piper-cyan/20 mb-6">
            <span className="text-xs font-semibold text-piper-blue dark:text-piper-cyan ">
              Powered by AI and Education Science
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Create Custom Learning Journeys
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Tell Piper what you want to learn, and it'll generate a tailored course just for you — no materials needed.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Course Generator Controls */}
          <div className="w-full lg:w-2/5 bg-white dark:bg-piper-darkblue rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">What do you want to learn?</label>
                <div className="relative gap-2">
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., Machine Learning for Beginners" 
                    defaultValue="Introduction to Quantum Computing"
                  />
                  <div className="hidden md:block absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Sparkles className="h-5 w-5 text-piper-blue dark:text-piper-cyan" />
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">Course Complexity</label>
                  <span className="text-sm text-gray-500">
                    {courseComplexity < 30 ? 'Beginner' : courseComplexity < 70 ? 'Intermediate' : 'Advanced'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-gray-400" />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={courseComplexity} 
                    onChange={(e) => setCourseComplexity(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-piper-blue dark:[&::-webkit-slider-thumb]:bg-piper-cyan"
                  />
                  <Target className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">Course Duration</label>
                  <span className="text-sm text-gray-500">
                    {courseDuration < 30 ? '1-2 hours' : courseDuration < 70 ? '4-6 hours' : '10+ hours'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={courseDuration} 
                    onChange={(e) => setCourseDuration(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-piper-blue dark:[&::-webkit-slider-thumb]:bg-piper-cyan"
                  />
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">Interactivity Level</label>
                  <span className="text-sm text-gray-500">
                    {interactivityLevel < 30 ? 'Mostly Text' : interactivityLevel < 70 ? 'Balanced' : 'Highly Interactive'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={interactivityLevel} 
                    onChange={(e) => setInteractivityLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-piper-blue dark:[&::-webkit-slider-thumb]:bg-piper-cyan"
                  />
                  <Sliders className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="pt-4">
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-800 dark:text-gray-200 flex items-center">
                    <Check className="h-3 w-3 mr-1 text-piper-blue dark:text-piper-cyan" />
                    Include quizzes
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-800 dark:text-gray-200 flex items-center">
                    <Check className="h-3 w-3 mr-1 text-piper-blue dark:text-piper-cyan" />
                    Interactive examples
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-800 dark:text-gray-200 flex items-center">
                    <Check className="h-3 w-3 mr-1 text-piper-blue dark:text-piper-cyan" />
                    Real-world applications
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-800 dark:text-gray-200 flex items-center">
                    <Check className="h-3 w-3 mr-1 text-piper-blue dark:text-piper-cyan" />
                    Code examples
                  </span>
                </div>
                
                <button className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-piper-blue dark:bg-piper-cyan dark:text-piper-darkblue hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/90 transition-colors shadow-md hover:shadow-lg">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Generate Custom Course
                </button>
              </div>
            </div>
          </div>
          
          {/* Course Preview */}
          <div className="w-full lg:w-3/5">
            <div className="bg-white dark:bg-piper-darkblue rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex md:justify-between flex-col md:flex-row md:items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-piper-blue dark:bg-piper-cyan flex items-center justify-center text-white">
                    <BookMarked className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Introduction to Quantum Computing</h3>
                    <div className="flex items-center   md:gap-0 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-3.5 w-3.5 mr-1 hidden md:block" />
                      <p>
                      6 hours • 5 modules • Generated by Piper AI
                    
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 justify-end md:justify-normal mt-2 md:mt-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-piper-blue text-piper-blue dark:fill-piper-cyan dark:text-piper-cyan" />
                  ))}
                </div>
              </div>
              
              <div className="h-[400px] overflow-y-auto p-6">
                <div className="space-y-4">
                  {/* Module 1 */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <Layers className="h-4 w-4 text-piper-blue mr-2 dark:text-piper-cyan" />
                        <span className="font-medium text-sm">Module 1: Fundamentals of Quantum Mechanics</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <span className="text-sm">Quantum States and Superposition</span>
                        </div>
                        <span className="text-xs text-gray-500">20 min</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <span className="text-sm">Quantum Measurement and Uncertainty</span>
                        </div>
                        <span className="text-xs text-gray-500">25 min</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <span className="text-sm">Interactive: Visualizing Superposition</span>
                        </div>
                        <span className="text-xs text-gray-500">15 min</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-piper-blue/20 dark:bg-piper-cyan/20 flex items-center justify-center">
                            <Award className="h-4 w-4 text-piper-blue dark:text-piper-cyan" />
                          </div>
                          <span className="text-sm font-medium text-piper-blue dark:text-piper-cyan">Module 1 Assessment</span>
                        </div>
                        <span className="text-xs text-gray-500">10 min</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Module 2 */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <Layers className="h-4 w-4 text-piper-blue dark:text-piper-cyan mr-2" />
                        <span className="font-medium text-sm">Module 2: Quantum Bits and Information</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <span className="text-sm">Introduction to Qubits</span>
                        </div>
                        <span className="text-xs text-gray-500">30 min</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <span className="text-sm">Quantum Gates and Circuits</span>
                        </div>
                        <span className="text-xs text-gray-500">35 min</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Module 3 */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <Layers className="h-4 w-4 text-piper-blue mr-2 dark:text-piper-cyan" />
                        <span className="font-medium text-sm">Module 3: Quantum Algorithms</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                  
                  {/* Module 4 */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <Layers className="h-4 w-4 text-piper-blue mr-2 dark:text-piper-cyan" />
                        <span className="font-medium text-sm">Module 4: Quantum Hardware</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                  
                  {/* Module 5 */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <Layers className="h-4 w-4 text-piper-blue dark:text-piper-cyan mr-2" />
                        <span className="font-medium text-sm">Module 5: Practical Applications</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between items-center gap-2 md:gap-0">
                  <button className="inline-flex items-center justify-center px-2 md:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white dark:text-piper-darkblue bg-piper-blue dark:bg-piper-cyan dark:hover:bg-piper-cyan/90 hover:bg-piper-blue/90 transition-colors">
                    <GraduationCap className="md:mr-2 h-4 w-4" />
                    Start Learning
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button className="inline-flex items-center justify-center p-2 border border-gray-200 dark:border-gray-700 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <span className="sr-only">Export</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button className="inline-flex items-center justify-center p-2 border border-gray-200 dark:border-gray-700 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <span className="sr-only">Save</span>
                      <BookMarked className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseGenerator;