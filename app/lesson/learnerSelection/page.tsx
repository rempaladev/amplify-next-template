"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LearnerSelectionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<"free" | "paid" | null>(null);

  const goFree = () => {
    setSelected("free");
    // TODO: route to free agent experience
    // router.push("/lesson/learner"); // example
  };

  const goPaid = () => {
    setSelected("paid");
    // TODO: route to paid agent experience or checkout
    // router.push("/lesson/advanced"); // example
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Choose Your Agent</h1>
        <p className="text-muted-foreground mb-8">
          Pick the assistant that fits your needs right now. You can switch
          anytime.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Agent Card */}
          <button
            className={`group text-left rounded-lg border p-6 transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              selected === "free"
                ? "ring-2 ring-green-500"
                : "hover:border-green-400"
            }`}
            onClick={goFree}
            aria-label="Select Free Agent"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Free Agent</h2>
              <span className="rounded-full bg-green-100 text-green-800 text-xs px-2 py-1">
                Free
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Get started instantly with core features and basic guidance.
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Real-time transcription
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Basic responses and TTS
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Community support
              </li>
            </ul>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Best for trying things out
              </span>
              <span className="inline-flex items-center gap-2 text-green-700 group-hover:text-green-800">
                Use Free Agent
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </button>

          {/* Paid Agent Card */}
          <button
            className={`group text-left rounded-lg border p-6 transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              selected === "paid"
                ? "ring-2 ring-blue-500"
                : "hover:border-blue-400"
            }`}
            onClick={goPaid}
            aria-label="Select Paid Agent"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Paid Agent</h2>
              <span className="rounded-full bg-blue-100 text-blue-800 text-xs px-2 py-1">
                Pro
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Unlock faster, higher-quality responses, priority TTS, and advanced
              guidance.
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Priority latency optimization for TTS
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Richer prompts and longer context
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Email support and SLA
              </li>
            </ul>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Best for daily use
              </span>
              <span className="inline-flex items-center gap-2 text-blue-700 group-hover:text-blue-800">
                Upgrade to Paid Agent
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </button>
        </div>

        {/* Action row */}
        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            className="px-4 py-2 rounded border hover:bg-accent hover:text-accent-foreground"
            onClick={() => router.push("/lesson")}
          >
            Back
          </button>
          <button
            className={`px-4 py-2 rounded text-white transition ${
              selected
                ? "bg-black hover:bg-neutral-800"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={() => {
              if (selected === "free") {
                // wire this to your free agent route
                router.push("/lesson/learnerSelection/openaiLearner")
              } else if (selected === "paid") {
                // wire this to your paid agent route/checkout
                router.push("/lesson/learnerSelection/learner")
              }
            }}
            disabled={!selected}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}