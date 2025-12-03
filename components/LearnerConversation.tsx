"use client";
import { useScribe, CommitStrategy } from "@elevenlabs/react";
import { useRef, useMemo, useState, useEffect } from "react";

async function fetchTokenFromServer() {
  const response = await fetch("/api/elevenlabs-pipeline-auth/scribe-token");
  const data = await response.json();
  return data.token;
}

async function sendToOpenAI(transcript: string, sessionId: string) {
  const response = await fetch("/api/elevenlabs-pipeline-auth/open-api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: transcript, sessionId }),
  });
  const data = await response.json();
  return data.response;
}

async function playTextToSpeech(text: string) {
  try {
    const audio = new Audio();
    audio.src = `/api/elevenlabs-pipeline-auth/open-api/text-to-speech?text=${encodeURIComponent(text)}`;
    return new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(e);
      audio.play();
    });
  } catch (error) {
    console.error("Error playing audio:", error);
  }
}

export function LearnerConversation() {
  const sessionId = useRef(Date.now().toString()).current;

  // Conversation log
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string; ts: number }[]
  >([]);
  const [partial, setPartial] = useState<string>("");

  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // Auto-scroll to bottom when messages or partial change
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, partial]);

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    onPartialTranscript: (data) => {
      setPartial(data.text ?? "");
    },
    onCommittedTranscript: async (data) => {
      const text = (data.text ?? "").trim();
      setPartial(""); // clear partial when committed

      if (!text) return;

      // Add user's committed utterance
      setMessages((prev) => [...prev, { role: "user", text, ts: Date.now() }]);

      // Get AI response
      const aiStart = performance.now();
      const aiResponse = await sendToOpenAI(text, sessionId);
      console.log("OpenAI took:", (performance.now() - aiStart).toFixed(2), "ms");

      // Add assistant response
      setMessages((prev) => [...prev, { role: "assistant", text: aiResponse, ts: Date.now() }]);

      // Speak the response
      let startFetch = performance.now();
      await playTextToSpeech(aiResponse);
      console.log("Total TTS time:", (performance.now() - startFetch).toFixed(2), "ms");
    },
    onCommittedTranscriptWithTimestamps: (data) => {
      // Optional: you could attach timestamps to last user message if needed
      console.log("Committed with timestamps:", data.text);
    },
  });

  const isConnecting = useMemo(() => scribe.status === "connecting", [scribe.status]);
  const isConnected = useMemo(() => scribe.status === "connected", [scribe.status]);
  const isDisconnected = useMemo(() => scribe.status === "disconnected", [scribe.status]);

  const handleStart = async () => {
    if (isConnected || isConnecting) return;
    const token = await fetchTokenFromServer();
    await scribe.connect({
      token,
      commitStrategy: CommitStrategy.VAD,
      vadSilenceThresholdSecs: 0.5,
      microphone: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
  };

  const handleStop = async () => {
    await scribe.disconnect();
    setPartial("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Learner Conversation</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Practice with a patient AI teacher. This mode is ideal for beginners and focuses on clarity, repetition, and guidance.
      </p>

      <div className="w-full max-w-2xl rounded-lg border bg-background p-6">
        {/* Status pills */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm">Status:</span>
          {isDisconnected && (
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
              <span className="h-2 w-2 rounded-full bg-gray-400" />
              Disconnected
            </span>
          )}
          {isConnecting && (
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-800">
              <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
              Connecting…
            </span>
          )}
          {isConnected && (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Connected
            </span>
          )}
        </div>

        {/* Speak indicator */}
        {isConnected ? (
          <div className="mb-3 flex items-center justify-center">
            <div className="flex items-center gap-3 rounded-md border px-4 py-3 bg-green-50 text-green-700">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <span className="font-medium">Speak now</span>
            </div>
          </div>
        ) : (
          <div className="mb-3 flex items-center justify-center">
            <div className="flex items-center gap-3 rounded-md border px-4 py-3 bg-gray-50 text-gray-700">
              <span className="h-3 w-3 rounded-full bg-gray-400" />
              <span className="font-medium">Click Start Conversation</span>
            </div>
          </div>
        )}

        {/* Transcript list */}
        <div
          ref={listRef}
          className="h-64 overflow-y-auto rounded border bg-muted/20 p-4 space-y-3"
        >
          {messages.map((m, i) => (
            <div
              key={m.ts + "-" + i}
              className={`max-w-[85%] rounded px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-blue-50 text-blue-900 ml-auto"
                  : "bg-gray-100 text-gray-900 mr-auto"
              }`}
            >
              {m.text}
            </div>
          ))}

          {/* Live partial while speaking */}
          {partial && (
            <div className="max-w-[85%] rounded px-3 py-2 text-sm bg-blue-100 text-blue-900 ml-auto opacity-70">
              {partial}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex gap-3">
          <button
            className={`px-4 py-2 rounded text-white transition ${
              isConnected ? "bg-green-600 hover:bg-green-700" : isConnecting ? "bg-yellow-500" : "bg-blue-600 hover:bg-blue-700"
            } disabled:opacity-50`}
            onClick={handleStart}
            disabled={isConnected || isConnecting}
          >
            {isConnected ? "Connected" : isConnecting ? "Connecting…" : "Start Conversation"}
          </button>
          <button
            className="px-4 py-2 rounded border hover:bg-accent hover:text-accent-foreground"
            onClick={handleStop}
            disabled={isDisconnected || isConnecting}
          >
            Stop Conversation
          </button>
        </div>
      </div>
    </div>
  );
}