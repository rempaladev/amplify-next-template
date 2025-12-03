import { NextResponse } from "next/server";
import https from "node:https";

// Keep-alive to reduce TLS handshake overhead on repeated calls
const keepAliveAgent = new https.Agent({ keepAlive: true });

// Simple in-memory store (resets on server restart)
const conversationHistory = new Map<string, Array<{ role: "system" | "user" | "assistant"; content: string }>>();
const { content } = require("./prompts");

// Limit the number of turns kept (reduces payload and latency)
const MAX_TURNS = 8;

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  const body = await req.json();
  const message: string = body.message;
  const sessionId: string = body.sessionId || "default";

  if (!message) {
    return NextResponse.json({ error: "Missing 'message' in body" }, { status: 400 });
  }

  // Initialize history with system prompt
  if (!conversationHistory.has(sessionId)) {
    conversationHistory.set(sessionId, [{ role: "system", content }]);
  }

  const history = conversationHistory.get(sessionId)!;
  history.push({ role: "user", content: message });

  // Trim history to last MAX_TURNS user/assistant pairs plus system
  const systemMsg = history[0];
  const tail = history.slice(1).slice(-MAX_TURNS);
  const messages = [systemMsg, ...tail];

  // Stream response from OpenAI via SSE
  const openAiResp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      Connection: "keep-alive",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      stream: true,           // enable streaming
      temperature: 0.7,
      max_tokens: 256,        // adjust lower for faster first token
    }),
    // @ts-expect-error: pass Node agent to undici
    agent: keepAliveAgent,
  });

  if (!openAiResp.ok || !openAiResp.body) {
    const errText = await openAiResp.text();
    console.error("OpenAI stream error:", openAiResp.status, errText);
    return NextResponse.json({ error: "OpenAI request failed" }, { status: openAiResp.status });
  }

  const readable = openAiResp.body;
  const decoder = new TextDecoder();
  const reader = readable.getReader(); // move outside pull
  let finalText = "";

  const stream = new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          if (finalText.trim().length > 0) {
            history.push({ role: "assistant", content: finalText });
          }
          return;
        }
        const chunk = decoder.decode(value, { stream: true });

        // Forward SSE chunks to client
        controller.enqueue(value);

        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") continue;
            try {
              const payload = JSON.parse(dataStr);
              const delta = payload?.choices?.[0]?.delta?.content;
              if (typeof delta === "string") finalText += delta;
            } catch { /* ignore */ }
          }
        }
      } catch (e) {
        console.error("Stream read error:", e);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}