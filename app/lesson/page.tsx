"use client";

import Link from "next/link";

export default function LessonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Choose Your Conversation Level</h1>

      <div className="flex gap-6 flex-wrap justify-center">
        {/* Advanced/Fluent Conversation Card */}
        <Link href="/lesson/advanced" className="flex flex-col items-center p-6 w-80 h-96 bg-white border-2 border-gray-200 rounded-lg shadow-lg hover:shadow-xl hover:border-blue-500 transition-all">
          <div className="w-full h-48 mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-6xl">🗣️</span>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">Fluent Conversation</h2>
          <p className="text-gray-600 text-center">
            Practice speaking with an advanced AI agent. Perfect for improving fluency and natural conversation skills.
          </p>
        </Link>
        {/* Beginner Conversation Card */}
        <Link href="/lesson/learner" className="flex flex-col items-center p-6 w-80 h-96 bg-white border-2 border-gray-200 rounded-lg shadow-lg hover:shadow-xl hover:border-green-500 transition-all">
          <div className="w-full h-48 mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
            <span className="text-6xl">🌱</span>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">Beginner Conversation</h2>
          <p className="text-gray-600 text-center">
            Start your language journey with a patient AI teacher. Ideal for learners just beginning their practice.
          </p>
        </Link>
      </div>
    </div>
  );
}