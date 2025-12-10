"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FreeLearner() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string; ts: number }[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const mockSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text, ts: Date.now() }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Echo: ${text}`, ts: Date.now() },
      ]);
    }, 400);
  };

  const mockToggleMic = () => {
    if (!isRecording) {
      startRecording().catch((e) => console.error("Mic error:", e));
    } else {
      stopRecording();
    }
  };

  const mockReplay = (text: string) => {
    console.log("Replay TTS:", text);
  };

  const mockClear = () => {
    setMessages([]);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recordedChunksRef.current = [];
    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    mr.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
      console.log("Recorded blob:", blob);
      // Send to STT
      const form = new FormData();
      form.append("file", blob, "speech.webm");

      try {
        const resp = await fetch("/api/openai/stt", { method: "POST", body: form });
        const data = await resp.json();
        const transcript = (data.text ?? "").trim();
        if (transcript) {
          setMessages((prev) => [...prev, { role: "user", text: transcript, ts: Date.now() }]);
          // Mock assistant reply
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", text: `Heard: "${transcript}"`, ts: Date.now() },
            ]);
          }, 400);
        }
      } catch (err) {
        console.error("STT error:", err);
      }
    };
    mediaRecorderRef.current = mr;
    mr.start(100); // collect chunks every 100ms
    setIsRecording(true);
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.stop();
    }
    setIsRecording(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Free Agent</div>
        <div className="flex items-center gap-2">
          <Button
            variant={isRecording ? "default" : "outline"}
            onClick={mockToggleMic}
            aria-pressed={isRecording}
          >
            {isRecording ? "Stop Mic" : "Start Mic"}
          </Button>
          <Button variant="outline" onClick={mockClear}>
            Clear
          </Button>
        </div>
      </div>

      <div ref={listRef} className="h-72 overflow-y-auto rounded border bg-muted/20 p-4 space-y-3">
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
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs px-2 py-1"
                  onClick={() => mockReplay(m.text)}
                  aria-label="Replay audio"
                >
                  Replay
                </Button>
              )}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-xs text-muted-foreground">
            Try typing a message or use the mic.
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          placeholder="Message the Free Agent"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") mockSend();
          }}
        />
        <Button onClick={mockSend}>Send</Button>
      </div>
    </div>
  );
}