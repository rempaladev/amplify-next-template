"use client";
import React, { useEffect, useRef, useState } from "react";

function ChatPage() {

    const fetchEphemeralKey = async (): Promise<string | null> => {
        const tokenResponse = await fetch("/api/session");
        const data = await tokenResponse.json();

        if (!data.client_secret?.value) {
            console.error("No ephemeral key provided by the server");
            return null;
        }

        return data.client_secret.value;
    };



    

    



    return (<div>Chat Page V1</div>);
}

export default ChatPage;
