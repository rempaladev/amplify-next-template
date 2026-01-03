import { useCallback, useRef, useState, useEffect } from 'react';
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
  initialAgents: RealtimeAgent[];
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

    const connect = useCallback(
        async ({
        getEphemeralKey,
        initialAgents,
        audioElement,
        extraContext,
        }: ConnectOptions) => {
        if (sessionRef.current) return; // already connected

        updateStatus('CONNECTING');

        const ek = await getEphemeralKey();
        const rootAgent = initialAgents[0];

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

    const disconnect = useCallback(() => {
        sessionRef.current?.close();
        sessionRef.current = null;
        updateStatus('DISCONNECTED');
    }, [updateStatus]);

    return {
    status,
    connect,
    disconnect,
  } as const;
}


