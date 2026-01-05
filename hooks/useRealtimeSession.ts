import { useCallback, useRef, useState, useEffect } from 'react';
import { useHandleSessionHistory } from './useHandleSessionHistory';

import {
  RealtimeSession,
  RealtimeAgent,
  OpenAIRealtimeWebRTC,
} from '@openai/agents/realtime';

export type SessionStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED";

export interface RealtimeSessionCallbacks {
  onConnectionChange?: (status: SessionStatus) => void;
}

export interface ConnectOptions {
  getEphemeralKey: () => Promise<string>;
  initialAgent: RealtimeAgent;
  audioElement?: HTMLAudioElement;
  extraContext?: Record<string, any>;
  outputGuardrails?: any[];
}

export function useRealtimeSession(callbacks: RealtimeSessionCallbacks = {}){

    const sessionRef = useRef<RealtimeSession | null>(null);
    const [status, setStatus] = useState<SessionStatus>('DISCONNECTED');
    const updateStatus = useCallback(
        (s: SessionStatus) => {
            setStatus(s); 
            callbacks.onConnectionChange?.(s);
        },
        [callbacks],
    );

  const historyHandlers = useHandleSessionHistory().current;

  function handleTransportEvent(event: any) {
    // Handle additional server events that aren't managed by the session
    switch (event.type) {
      case "conversation.item.input_audio_transcription.completed": {
        historyHandlers.handleTranscriptionCompleted(event);
        break;
      }
      case "response.audio_transcript.done": {
        historyHandlers.handleTranscriptionCompleted(event);
        break;
      }
      case "response.audio_transcript.delta": {
        historyHandlers.handleTranscriptionDelta(event);
        break;
      }
      default: {
        break;
      } 
    }
  }

  useEffect(() => {
    if (sessionRef.current) {
      // history events
      sessionRef.current.on("agent_tool_start", historyHandlers.handleAgentToolStart);
      sessionRef.current.on("agent_tool_end", historyHandlers.handleAgentToolEnd);
      sessionRef.current.on("history_updated", historyHandlers.handleHistoryUpdated);
      sessionRef.current.on("history_added", historyHandlers.handleHistoryAdded);

      // additional transport events
      sessionRef.current.on("transport_event", handleTransportEvent);
    }
  }, [sessionRef.current]);

    const connect = useCallback(
        async ({
        getEphemeralKey,
        initialAgent,
        audioElement,
        extraContext,
        }: ConnectOptions) => {
        if (sessionRef.current) return; // already connected

        updateStatus('CONNECTING');

        const ek = await getEphemeralKey();
        const rootAgent = initialAgent;

        sessionRef.current = new RealtimeSession(rootAgent, {
            transport: new OpenAIRealtimeWebRTC({
            audioElement,         
            }),
            model: 'gpt-4o-realtime-preview-2025-06-03',
            config: {
            inputAudioTranscription: {
                model: 'gpt-4o-mini-transcribe',
            },
            },
            context: extraContext ?? {},
        });

        await sessionRef.current.connect({ apiKey: ek });
        updateStatus('CONNECTED');
        },
        [callbacks, updateStatus],
    );

    const assertconnected = () => {
    if (!sessionRef.current) throw new Error('RealtimeSession not connected');
  };

    const disconnect = useCallback(() => {
        sessionRef.current?.close();
        sessionRef.current = null;
        updateStatus('DISCONNECTED');
    }, [updateStatus]);

    const interrupt = useCallback(() => {
    sessionRef.current?.interrupt();
  }, []);

   const sendUserText = useCallback((text: string) => {
    assertconnected();
    sessionRef.current!.sendMessage(text);
  }, []);

    return {
    status,
    connect,
    disconnect,
    interrupt,
    sendUserText,
  } as const;
}



