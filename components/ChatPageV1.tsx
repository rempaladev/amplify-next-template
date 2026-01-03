"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import useAudioDownload from "@/hooks/useAudioDownload";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  time: number;
  language: string;
};

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pl", label: "Polski" },
  { code: "zh", label: "中文" },
];

export default function ChatPage() {
  const [connected, setConnected] = useState(false);
  const [language, setLanguage] = useState<string>("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll transcript
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sdkAudioElement = React.useMemo(() => {
        if (typeof window === 'undefined') return undefined;
        const el = document.createElement('audio');
        el.autoplay = true;
        el.style.display = 'none';
        document.body.appendChild(el);
        return el;
      }, []);

  // Stub: connect to your voice agent (WebRTC/WebSocket)
  const handleConnect = async () => {
    try {
      startListening();
      setConnected(true);
      // TODO: initialize your voice session here
      // Example: const session = await startVoiceSession({ language });
    } catch (e) {
      console.error(e);
      setConnected(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      // TODO: teardown voice/WebRTC session
    } finally {
      setConnected(false);
      stopRecording();
    }
  };

   // Initialize the recording hook.
  const { startRecording, stopRecording, downloadRecording } =
    useAudioDownload();

  // Mic recording (browser MediaRecorder stub)
  const startListening = async () => {
    try {
      if (sdkAudioElement && !audioElementRef.current) {
        audioElementRef.current = sdkAudioElement;
      }

      setRecording(true);
      startRecording(audioElementRef.current!.srcObject as MediaStream);

      // TODO: pipe audio to your voice agent here
      // const recorder = new MediaRecorder(stream);
      // recorder.ondataavailable = (e) => sendChunkToAgent(e.data);
      // recorder.start(250);
    } catch (e) {
      console.error(e);
      setRecording(false);
    }
  };

  const stopListening = () => {
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    mediaStreamRef.current = null;
    setRecording(false);
  };


  return (
    <div className="flex h-dvh w-full flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-2 border-b px-3 py-2">
        {/* Mobile menu placeholder via Sheet */}
        {/* Language selector (desktop) */}
        <div className="hidden items-center gap-2 sm:flex">
          <LanguageSelect value={language} onChange={setLanguage} />
        </div>

        {/* Voice controls */}
        <TooltipProvider>
          <div className="flex items-center gap-2">
            {!connected ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={recording ? "destructive" : "default"} size="sm" onClick={handleConnect}>Connect Voice</Button>
                </TooltipTrigger>
                <TooltipContent>Start a voice session</TooltipContent>
              </Tooltip>
            ) : (
            <div>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button size="sm" variant="destructive" onClick={handleDisconnect}>Disconnect</Button>
                    </TooltipTrigger>
                    <TooltipContent>End voice session</TooltipContent>
                </Tooltip>      
            </div>
            )}
           
          </div>
        </TooltipProvider>

          {connected && recording ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Connected
                </span>
            ):(
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-green-800">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    Disconnected
                </span>
            )}
      </div>

      {/* Main Area */}
      <div className="flex min-h-0 flex-1 flex-col">
            {/* Transcript */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-3">
                {messages.map(m => (
                    <MessageBubble key={m.id} msg={m} />
                ))}
                </div>
            )}
            </div>      
        </div>
    </div>
  );
}

function LanguageSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border bg-background px-2 text-sm"
      aria-label="Select language"
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
      <div className="mb-2 text-base font-medium">No messages yet</div>
      <div>Connect the voice agent or type to start.</div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="font-medium">{isUser ? "You" : "Assistant"}</span>
          <span className="text-xs opacity-70">
            {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="whitespace-pre-wrap">{msg.text}</div>
        <div className="mt-1 text-[10px] opacity-60">Lang: {msg.language.toUpperCase()}</div>
      </div>
    </div>
  );
}