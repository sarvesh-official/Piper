import {
  ArrowRight,
  FileText,
  MessageCircle,
  Upload,
  CheckSquare,
  Send,
  User,
  ChevronRight,
  Dices,
  ChevronDown
} from "lucide-react";

import { useState } from "react";
import TypewriterEffect from "./ui/TypewriteEffect";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "./ui/button";

export const Hero = () => {
  const [activeTab, setActiveTab] = useState<"upload" | "chat" | "quiz">(
    "upload"
  );

  return (
    <section
      id="hero"
      className="relative pt-20 lg:pt-24 pb-20 overflow-hidden"
    >
      <div className="absolute inset-0 z-0 dark:invert ">
        <img
          src="/abstract-grid.svg"
          alt=""
          className="w-full h-full object-cover dark:opacity-50 opacity-75"
        />
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mt-12 md:mt-16 lg:mt-20">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-piper-blue/10 dark:bg-piper-blue/20 border border-piper-blue/20 mb-6 animate-fade-in animation-delay-100">
            <span className="text-xs font-semibold text-piper-blue dark:text-piper-cyan">
              Introducing Piper AI - Your Intelligent Learning Assistant
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 animate-fade-in animation-delay-200">
            <span className="block">Learn smarter with</span>
            <span className="mt-2 inline-block">
              <TypewriterEffect
                words={[
                  "AI-powered courses",
                  "intelligent assistance",
                  "personalized learning",
                  "structured pathways"
                ]}
                className="text-gradient"
              />
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl animate-fade-in animation-delay-300">
            Piper transforms how you learn by adapting to your style, connecting
            ideas across resources, and creating personalized learning
            experiences that boost efficiency by up to 300%.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10 animate-fade-in animation-delay-500">
           <SignedOut>
            <Link
              href={"/sign-in"}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white dark:text-piper-darkblue bg-piper-blue dark:bg-piper-cyan/90 hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/80 transition-colors shadow-md hover:shadow-lg"
              >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
              </SignedOut> 
           <SignedIn>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white dark:text-piper-darkblue bg-piper-blue dark:bg-piper-cyan/90 hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/80 transition-colors shadow-md hover:shadow-lg"
              >
              Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
              </SignedIn> 
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-md text-gray-900 dark:text-white bg-white dark:bg-piper-darkblue hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              How It Works
            </Link>
          </div>

          <div className="mt-16 mb-8 relative animate-fade-in animation-delay-700 w-full max-w-5xl">
            <div className="absolute -inset-0.5 bg-gradient-blue dark:bg-gradient-purple opacity-30 blur-xl rounded-2xl"></div>
            <div className="relative bg-white dark:bg-background rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
              {/* RAG Application Mockup */}
              <div className="w-full h-[600px] flex flex-col">
                {/* App header */}
                <div className="bg-gray-50 dark:bg-piper-darkblue border-b border-gray-200 dark:border-gray-500 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-piper-blue/20 dark:bg-piper-cyan/20 flex items-center justify-center">
                        <img
                          src="/piper-mascot.svg"
                          alt=""
                          className="w-6 h-6"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-left text-gray-900 dark:text-white">
                          Piper Knowledge Assistant
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Your AI-powered learning companion
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* App tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#00BCFF #1E293B', }}>
                 
                  <button
                    className={`px-4 py-3 text-sm font-medium flex items-center ${
                      activeTab === "upload"
                        ? "text-piper-blue border-b-2 border-piper-blue dark:text-piper-cyan dark:border-piper-cyan"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                    onClick={() => setActiveTab("upload")}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Documents
                  </button>
                  <button
                    className={`px-4 py-3 text-sm font-medium flex items-center ${
                      activeTab === "chat"
                        ? "text-piper-blue dark:text-piper-cyan border-b-2 border-piper-blue dark:border-piper-cyan"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                    onClick={() => setActiveTab("chat")}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Ask Questions
                  </button>
                  <button
                    className={`px-4 py-3 text-sm font-medium flex items-center ${
                      activeTab === "quiz"
                        ? "text-piper-blue border-b-2 border-piper-blue dark:text-piper-cyan dark:border-piper-cyan"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                    onClick={() => setActiveTab("quiz")}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Generate Quiz
                  </button>
                </div>

                {/* App content */}
                <div className="flex-1 overflow-auto">
                  {/* Upload tab content */}
                  {activeTab === "upload" && (
                    <div className="p-6 h-full flex flex-col pt-52 md:pt-6 items-center justify-center">
                      <div className="w-full max-w-md p-6 border-2 border-dashed border-gray-300  dark:border-gray-700 rounded-lg flex flex-col items-center">
                        <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Upload your documents
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                          Drag and drop your files here, or click to browse
                        </p>
                        <div className="flex flex-wrap gap-4 mb-4 w-full justify-center">
                          <div className="bg-gray-100 dark:bg-piper-darkblue rounded px-3 py-1.5 text-xs font-medium flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            PDF
                          </div>
                          <div className="bg-gray-100 dark:bg-piper-darkblue rounded px-3 py-1.5 text-xs font-medium flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            DOCX
                          </div>
                          <div className="bg-gray-100 dark:bg-piper-darkblue rounded px-3 py-1.5 text-xs font-medium flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            TXT
                          </div>
                          <div className="bg-gray-100 dark:bg-piper-darkblue rounded px-3 py-1.5 text-xs font-medium flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            CSV
                          </div>
                        </div>
                        <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white dark:text-piper-darkblue bg-piper-blue dark:bg-piper-cyan hover:bg-piper-blue/90 dark:hover:bg-piper-cyan/90 transition-colors">
                          Browse Files
                        </button>
                      </div>

                      <div className="w-full max-w-md mt-6 pb-6 md:pb-0">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Recently Uploaded
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-piper-darkblue rounded-lg">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                              <span className="text-sm">
                                Machine Learning Guide.pdf
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              2.4 MB
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-piper-darkblue rounded-lg">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                              <span className="text-sm">
                                Data Science Concepts.pdf
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              1.8 MB
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chat tab content */}
                  {activeTab === "chat" && (
                    <div className="flex flex-col h-full">
                      <div className="flex-1 overflow-auto p-6 space-y-6">
                        {/* AI message */}
                        <div className="flex items-start space-x-3 max-w-[80%]">
                          <div className="w-8 h-8 rounded-full bg-piper-blue dark:bg-piper-cyan flex items-center justify-center flex-shrink-0">
                            <img
                              src="/piper-mascot.svg"
                              alt=""
                              className="w-5 h-5"
                            />
                          </div>
                          <div className="bg-gray-100 dark:bg-piper-darkblue rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-piper-darkblue dark:text-gray-200">
                              I've processed your documents on machine learning.
                              What would you like to know about neural networks
                              or deep learning concepts?
                            </p>
                          </div>
                        </div>

                        {/* User message */}
                        <div className="flex items-start justify-end space-x-3 max-w-[80%] ml-auto">
                          <div className="bg-piper-blue dark:bg-piper-cyan text-white dark:text-piper-darkblue rounded-lg p-4 shadow-sm">
                            <p className="text-sm">
                              Can you explain the difference between CNN and RNN
                              models in simple terms?
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-piper-darkblue flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </div>
                        </div>

                        {/* AI response */}
                        <div className="flex items-start space-x-3 max-w-[80%]">
                          <div className="w-8 h-8 rounded-full bg-piper-blue dark:bg-piper-cyan flex items-center justify-center flex-shrink-0">
                            <img
                              src="/piper-mascot.svg"
                              alt=""
                              className="w-5 h-5"
                            />
                          </div>
                          <div className="space-y-3">
                            <div className="bg-gray-100 dark:bg-piper-darkblue rounded-lg p-4 shadow-sm">
                              <p className="text-sm text-piper-darkblue dark:text-gray-200">
                                <strong>
                                  CNNs (Convolutional Neural Networks)
                                </strong>{" "}
                                are like image specialists. They scan images
                                piece by piece to detect patterns like edges,
                                textures, and shapes. Think of them as art
                                critics analyzing paintings by looking at small
                                sections at a time. They're great for image
                                classification, object detection, and similar
                                visual tasks.
                              </p>
                            </div>

                            <div className="bg-gray-100 dark:bg-piper-darkblue rounded-lg p-4 shadow-sm">
                              <p className="text-sm text-piper-darkblue dark:text-gray-200">
                                <strong>
                                  RNNs (Recurrent Neural Networks)
                                </strong>{" "}
                                are more like language experts that remember
                                what they've seen before. They're designed to
                                work with sequences where each element relates
                                to what came before it. Imagine reading a book
                                and understanding each page in the context of
                                previous pages. They excel in text generation,
                                translation, and time-series prediction.
                              </p>
                            </div>

                            <div className="bg-gray-100 dark:bg-piper-darkblue rounded-lg p-4 shadow-sm">
                              <p className="text-sm text-piper-darkblue dark:text-gray-200">
                                <strong>Key Difference:</strong> CNNs focus on
                                spatial patterns (in images) while RNNs handle
                                sequential patterns (like text or time series)
                                where memory of previous inputs matters.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Chat input */}
                      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center bg-gray-50 dark:bg-piper-darkblue rounded-lg px-4 py-2">
                          <input
                            type="text"
                            placeholder="Ask a question about your documents..."
                            className="flex-1 bg-transparent border-0 focus:ring-0 text-gray-800 dark:text-gray-200 text-sm outline-none"
                          />
                          <button className="ml-2 rounded-full p-2 bg-piper-blue text-white flex items-center justify-center">
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quiz tab content */}
                  {activeTab === "quiz" && (
                    <div className="p-6 h-full">
                      <div className="max-w-lg mx-auto pb-4 space-y-6">
                        <div className="bg-white dark:bg-piper-darkblue border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Generate Quiz
                          </h3>

                          <div className="space-y-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Select Document
                              </label>
                              <div className="relative">
                                <select className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-piper-darkblue text-gray-900 dark:text-white">
                                  <option>Machine Learning Guide.pdf</option>
                                  <option>Data Science Concepts.pdf</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Number of Questions
                              </label>
                              <input
                                type="number"
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                defaultValue="10"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Difficulty Level
                              </label>
                              <div className="flex space-x-2">
                                <button className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-900 dark:text-white">
                                  Beginner
                                </button>
                                <button className="px-3 py-1.5 rounded-md bg-piper-blue dark:bg-piper-cyan dark:text-piper-darkblue text-sm font-medium text-white">
                                  Intermediate
                                </button>
                                <button className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-900 dark:text-white">
                                  Advanced
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Question Types
                              </label>
                              <div className="flex flex-wrap gap-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="mr-1.5"
                                    defaultChecked
                                  />
                                  <span className="text-sm">
                                    Multiple Choice
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="mr-1.5"
                                    defaultChecked
                                  />
                                  <span className="text-sm">True/False</span>
                                </div>
                                <div className="flex items-center">
                                  <input type="checkbox" className="mr-1.5" />
                                  <span className="text-sm">Short Answer</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white dark:text-piper-darkblue bg-piper-blue hover:bg-piper-blue/90 dark:bg-piper-cyan dark:hover:bg-piper-cyan/90 transition-colors">
                            <Dices className="mr-2 h-4 w-4" />
                            Generate Quiz
                          </button>
                        </div>

                        <div className="bg-white dark:bg-piper-darkblue border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Quiz Preview
                          </h3>

                          <div className="space-y-6">
                            <div>
                              <p className="text-sm font-medium mb-3">
                                Question 1 of 10
                              </p>
                              <p className="text-sm mb-4">
                                Which of the following is NOT a common
                                activation function used in neural networks?
                              </p>

                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <input type="radio" id="q1-a" name="q1" />
                                  <label htmlFor="q1-a" className="text-sm">
                                    ReLU (Rectified Linear Unit)
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input type="radio" id="q1-b" name="q1" />
                                  <label htmlFor="q1-b" className="text-sm">
                                    Sigmoid
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input type="radio" id="q1-c" name="q1" />
                                  <label htmlFor="q1-c" className="text-sm">
                                    Quantum Activation Function
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input type="radio" id="q1-d" name="q1" />
                                  <label htmlFor="q1-d" className="text-sm">
                                    Tanh
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                              <button className="inline-flex items-center justify-center px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300">
                                Previous
                              </button>
                              <button className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-piper-blue dark:text-piper-cyan">
                                Next
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute bottom-4 right-4">
                <img
                  src="/piper-mascot.svg"
                  alt=""
                  className="w-16 h-16 animate-float"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
