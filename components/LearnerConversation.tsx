"use client";
import { useScribe, CommitStrategy } from "@elevenlabs/react";
import { useRef, useMemo, useState, useEffect } from "react";

async function fetchTokenFromServer() {
  const response = await fetch("/api/elevenlabs-pipeline-auth/scribe-token");
  const data = await response.json();
  return data.token;
}

async function sendToOpenAIStream(transcript: string, sessionId: string, onChunk: (text: string) => void): Promise<string> {
  const resp = await fetch("/api/elevenlabs-pipeline-auth/open-api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: transcript, sessionId }),
  });
  if (!resp.ok || !resp.body) {
    throw new Error("Failed to stream OpenAI response");
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const dataStr = line.slice(6).trim();
      if (dataStr === "[DONE]") continue;
      try {
        const payload = JSON.parse(dataStr);
        const delta = payload?.choices?.[0]?.delta?.content;
        if (typeof delta === "string") {
          fullText += delta;
          onChunk(fullText);
        }
      } catch {
        // ignore
      }
    }
  }
  return fullText;
}

export function LearnerConversation() {
  const sessionId = useRef(Date.now().toString()).current;

  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string; ts: number }[]
  >([]);
  const [partial, setPartial] = useState<string>("");
  const listRef = useRef<HTMLDivElement | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playGenRef = useRef<number>(0); // increments to cancel stale plays

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "none";
    }
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, partial]);

  // Helper to update the latest assistant message text
  const updateAssistantText = (text: string) => {
    setMessages((prev) => {
      const lastAssistantIdx = [...prev].reverse().findIndex((m) => m.role === "assistant");
      if (lastAssistantIdx === -1) return prev;
      const idx = prev.length - 1 - lastAssistantIdx;
      const next = [...prev];
      next[idx] = { ...next[idx], text };
      return next;
    });
  };

  // Use a ref instead of window flags
  const ttsStartedRef = useRef(false);
  const firstSentenceRef = useRef<string | null>(null);

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    onPartialTranscript: (data) => {
      console.log("making it to partial transcript", data.text);
      setPartial(data.text ?? "");
      playGenRef.current++; // invalidate any in-flight play from prior commit
    },
    onCommittedTranscript: async (data) => {
      const text = (data.text ?? "").trim();
      console.log("Committed transcript:", text);
      setPartial("");
      if (!text) return;

      stopAudio();
      playGenRef.current++; // invalidate any in-flight play from prior commit

      // Add user's message
      setMessages((prev) => [...prev, { role: "user", text, ts: Date.now() }]);
      // Add assistant placeholder
      setMessages((prev) => [...prev, { role: "assistant", text: "", ts: Date.now() }]);

      const aiResponse = await sendToOpenAIStream(text, sessionId, (chunk) => {
        // Keep progressive UI updates
        updateAssistantText(chunk);
      });

      // One-shot TTS for the complete assistant response
      if (audioRef.current && aiResponse.trim()) {
        audioRef.current.src =
          `/api/elevenlabs-pipeline-auth/open-api/text-to-speech?text=${encodeURIComponent(aiResponse)}`;
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
      }
      ttsStartedRef.current = false;
      firstSentenceRef.current = null;

      // Ensure final assistant text is set
      updateAssistantText(aiResponse);
    },
    onCommittedTranscriptWithTimestamps: (data) => {
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
    
    let greeting = "Hello are you Ready to Learn! I am here to help you practice. Please say something when you are ready."
    setMessages((prev) => [...prev, { role: "assistant", text: greeting, ts: Date.now() }]);

    audioRef.current!.src =
        `/api/elevenlabs-pipeline-auth/open-api/text-to-speech?text=${encodeURIComponent(greeting)}`;
      audioRef.current!.load();
      audioRef.current!.play().catch(() => {});
  };

  const handleStop = async () => {
    audioRef.current?.pause();
    scribe.disconnect();
    setPartial("");
  };

  const stopAudio = () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      a.pause();
      a.currentTime = 0;
      // Clear source to cancel network/decoding
      a.removeAttribute("src"); // more robust than setting to ""
      a.load();
    } catch {}
  };

  const replayMessageAudio = (text: string) => {
    if (!text.trim() || !audioRef.current) return;
    stopAudio();
    audioRef.current.src =
      `/api/elevenlabs-pipeline-auth/open-api/text-to-speech?text=${encodeURIComponent(text)}`;
    audioRef.current.load();
    audioRef.current.play().catch(() => {});
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Learner Conversation</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Practice with a patient AI teacher. This mode is ideal for beginners and focuses on clarity, repetition, and guidance.
      </p>

      <div className="w-full max-w-2xl rounded-lg border bg-background p-6">
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

        <div ref={listRef} className="h-64 overflow-y-auto rounded border bg-muted/20 p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={m.ts + "-" + i}
              className={`max-w-[85%] rounded px-3 py-2 text-sm ${
                m.role === "user" ? "bg-blue-50 text-blue-900 ml-auto" : "bg-gray-100 text-gray-900 mr-auto"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span>{m.text}</span>
                {m.role === "assistant" && (
                  <button
                    className="text-xs px-2 py-1 rounded border hover:bg-accent"
                    onClick={() => replayMessageAudio(m.text)}
                    title="Replay audio"
                    aria-label="Replay audio"
                  >
                    Replay
                  </button>
                )}
              </div>
            </div>
          ))}
          {partial && (
            <div className="max-w-[85%] rounded px-3 py-2 text-sm bg-blue-100 text-blue-900 ml-auto opacity-70">
              {partial}
            </div>
          )}
        </div>

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