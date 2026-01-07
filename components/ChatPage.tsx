"use client";
import { tutorAgent } from "@/app/agent/tutorAgent";
import { SessionStatus, useRealtimeSession } from "@/hooks/useRealtimeSession";
import React, { useEffect, useRef, useState } from "react";
import BottomToolbar from "./BottomToolbar";
import Transcript from "./Transcript";

function ChatPage() {

    const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");
    const {connect, disconnect, interrupt, sendUserText} = useRealtimeSession({ onConnectionChange: (s) => setSessionStatus(s as SessionStatus)});
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const [userText, setUserText] = useState<string>("");

    const sdkAudioElement = React.useMemo(() => {
        if (typeof window === 'undefined') return undefined;
            const el = document.createElement('audio');
            el.autoplay = true;
            el.style.display = 'none';
            document.body.appendChild(el);
            return el;
    }, []);

    // Attach SDK audio element once it exists (after first render in browser)
    useEffect(() => {
        if (sdkAudioElement && !audioElementRef.current) {
            audioElementRef.current = sdkAudioElement;
        }
    }, [sdkAudioElement]);

    const onToggleConnection = () => {
        if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
        disconnectFromRealtime();
        setSessionStatus("DISCONNECTED");
        } else {
        connectToRealtime();
        }
    };

    const fetchEphemeralKey = async (): Promise<string | null> => {
        const tokenResponse = await fetch("/api/session");
        const data = await tokenResponse.json();
        if (!data.client_secret?.value) {
            console.error("No ephemeral key provided by the server");
            return null;
        }

        return data.client_secret.value;
    };

    const connectToRealtime = async () => {
        if (sessionStatus !== "DISCONNECTED") return;
        setSessionStatus("CONNECTING");
        try {
            const EPHEMERAL_KEY = await fetchEphemeralKey();
            if (!EPHEMERAL_KEY) return;

            await connect({
                getEphemeralKey: async () => EPHEMERAL_KEY,
                initialAgent: tutorAgent,
                audioElement: sdkAudioElement,
                extraContext: {
                    //leave blank for now
                },
            });
        } catch (err) {
            console.error("Error connecting via SDK:", err);
            setSessionStatus("DISCONNECTED");
        }
        return;
   };

    const handleSendTextMessage = () => {
    if (!userText.trim()) return;
        interrupt();

        try {
            sendUserText(userText.trim());
        } catch (err) {
            console.error('Failed to send via SDK', err);
        }

        setUserText("");
  };

    const disconnectFromRealtime = () => {
        disconnect();
        setSessionStatus("DISCONNECTED");
    };

    return (
    <div className="max-w-screen-md mx-auto p-2 sm:p-4 min-h-screen pb-20 sm:pb-24">
        <h1 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Chat Page</h1>

        <div className="flex flex-1 gap-2 overflow-hidden relative">
            <Transcript
                userText={userText}
                setUserText={setUserText}
                onSendMessage={handleSendTextMessage}
                canSend={
                    sessionStatus === "CONNECTED"
                }
            />
        </div>

        <BottomToolbar 
            sessionStatus={sessionStatus}
            onToggleConnection={onToggleConnection}
        />
    </div>);
}

export default ChatPage;
