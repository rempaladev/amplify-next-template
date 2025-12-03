"use client";
import { useScribe, CommitStrategy } from "@elevenlabs/react";
import { useRef } from "react";


async function fetchTokenFromServer() {
    const response = await fetch("/api/elevenlabs-pipeline-auth/scribe-token");
    const data = await response.json();
    return data.token;
  }

async function sendToOpenAI(transcript: string, sessionId: string) {
    const response = await fetch("/api/elevenlabs-pipeline-auth/open-api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            message: transcript,
            sessionId: sessionId 
        }),
    });
    const data = await response.json();
    return data.response;
}

async function playTextToSpeech(text: string) {
    try {
        const startFetch = performance.now();
        
        const response = await fetch("/api/elevenlabs-pipeline-auth/open-api/text-to-speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text }),
        });

        console.log("TTS API call took: " + (performance.now() - startFetch).toFixed(2) + " ms");

        const startBlob = performance.now();
        const audioBlob = await response.blob();
        console.log("Blob creation took: " + (performance.now() - startBlob).toFixed(2) + " ms");

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        const startAudioPlay = performance.now();
        return new Promise<void>((resolve, reject) => {
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                console.log("Total TTS time: " + (performance.now() - startFetch).toFixed(2) + " ms");
                resolve();
            };
            audio.onerror = reject;
            console.log("Audio play took: " + (performance.now() - startAudioPlay).toFixed(2) + " ms");
            audio.play();
        });
    } catch (error) {
        console.error("Error playing audio:", error);
    }
}

export function LearnerConversation(){

    const sessionId = useRef(Date.now().toString()).current;
    
    const scribe = useScribe({
        modelId: "scribe_v2_realtime",
        onPartialTranscript: (data) => {
            console.log("Partial:", data.text);
        },
        onCommittedTranscript: async (data) => {
            if (data.text && data.text.trim().length > 0) {
                console.log("Committed:", data.text);
                
                const totalStart = performance.now();
                
                const openAIStart = performance.now();
                const aiResponse = await sendToOpenAI(data.text, sessionId);
                console.log("OpenAI took: " + (performance.now() - openAIStart).toFixed(2) + " ms");
                console.log("AI Response:", aiResponse);
                
                await playTextToSpeech(aiResponse);
                
                console.log("Total pipeline time: " + (performance.now() - totalStart).toFixed(2) + " ms");
            } else {
                console.log("Skipping empty transcript");
            }
        },
        onCommittedTranscriptWithTimestamps: (data: { text: string; timestamps?: { start: number; end: number; }[] }) => {
            console.log("Committed with timestamps:", data.text);
            console.log("Timestamps:", data.timestamps);
        },
    });


   const handleStart = async () => {
        // Fetch a single use token from the server
        const token = await fetchTokenFromServer();

        console.log("Token:", token);

        await scribe.connect({
            token,
            commitStrategy: CommitStrategy.VAD,
            vadSilenceThresholdSecs: .5,
            microphone: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
            },
           
        });
    };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Learner Conversation</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Practice with a patient AI teacher. This mode is ideal for beginners and focuses on clarity, repetition, and guidance.
      </p>

      <div className="w-full max-w-lg rounded-lg border bg-background p-6">
        <div className="space-y-4 text-sm">
          <p>Status: Ready</p>
          <p>Tips: Ensure your microphone is enabled before starting.</p>
        </div>

        <div className="mt-6 flex gap-3">
          <button 
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleStart}
          >
            Start Conversation
          </button>
          <button className="px-4 py-2 rounded border hover:bg-accent hover:text-accent-foreground" onClick={() => scribe.disconnect()}>
            Stop Conversation
          </button>
        </div>
      </div>
    </div>
  )
}