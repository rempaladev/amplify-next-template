'use client';

import { getAgentId } from '@/lib/config';
import { useConversation } from '@elevenlabs/react';
import { useCallback, useEffect, useState } from 'react';

export function Conversation() {
  const [error, setError] = useState<string | null>(null);
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected');
      setError(null);
    },
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => {
      console.error('Error:', error);
      setError('Failed to connect to agent. Please try again.');
    },
  });

  const startWebRTC = async () =>{
    const res = await fetch('/api/elevenlabs-auth');
    if(!res.ok) throw new Error('Token fetch failed');
    const { conversation_token } = await res.json();

    console.log("Starting conversation with agent... " + conversation_token);

      //  Start with WebRTC
    await conversation.startSession({
      agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
      connectionType:'webrtc',
      conversationToken: conversation_token,
    });

    console.log('WebRTC session started');
  }

  const startConversation = useCallback(async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    await startWebRTC();
  } catch (error) {
    console.error('Failed to start conversation:', error);
    setError('Failed to start conversation. Please check your connection.');
  }}, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected'}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Start Conversation
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Stop Conversation
        </button>
      </div>

      <div className="flex flex-col items-center">
        <p>Status: {conversation.status}</p>
        <p>Agent is {conversation.isSpeaking ? 'speaking' : 'listening'}</p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}
