"use client";

import { Conversation } from "@/components/conversation";

export default function LessonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Welcome to a lesson!</h1>
      <Conversation/>
    </div>
  );
}