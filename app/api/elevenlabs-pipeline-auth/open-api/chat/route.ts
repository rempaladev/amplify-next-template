import { NextResponse } from "next/server";

// Simple in-memory store (resets on server restart)
const conversationHistory = new Map<string, Array<{ role: "system" | "user" | "assistant"; content: string }>>();
const {content} = require('./prompts')

export async function POST(req: Request) {

  console.log("Received request to /chat endpoint with body:", req.body);

  try {
    const body = await req.json(); // parse JSON from the request
    const message: string = body.message;
    const sessionId: string = body.sessionId || "default";
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    if (!message) {
      return NextResponse.json({ error: "Missing 'message' in body" }, { status: 400 });
    }

    // Initialize history
    if (!conversationHistory.has(sessionId)) {
      conversationHistory.set(sessionId, [{ role: "system", content }]);
    }

    const history = conversationHistory.get(sessionId)!;
    history.push({ role: "user", content: message });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: history,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI error:", response.status, text);
      return NextResponse.json({ error: "OpenAI request failed" }, { status: response.status });
    }

    const data = await response.json();

    if (!data?.choices?.[0]?.message?.content) {
      console.error("No choices in OpenAI response:", data);
      return NextResponse.json({ error: "Invalid OpenAI response" }, { status: 500 });
    }

    const assistantMessage: string = data.choices[0].message.content;
    history.push({ role: "assistant", content: assistantMessage });

    return NextResponse.json({ response: assistantMessage });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
  }
}