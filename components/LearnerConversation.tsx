`use client`;

export function LearnerConversation(){
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
          <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            Start Conversation
          </button>
          <button className="px-4 py-2 rounded border hover:bg-accent hover:text-accent-foreground">
            Stop
          </button>
        </div>
      </div>
    </div>
    )
}