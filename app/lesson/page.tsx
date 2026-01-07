"use client";

import ChatPage from "@/components/ChatPage";
import { TranscriptProvider } from "@/contexts/TranscriptContext";


export default function LessonPage() {
  return (
    <TranscriptProvider>
      <ChatPage/>
    </TranscriptProvider>
  );
}