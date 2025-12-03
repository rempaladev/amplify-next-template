import { NextResponse } from "next/server";
import https from "node:https";

export const dynamic = "force-dynamic";
const keepAliveAgent = new https.Agent({ keepAlive: true });

// POST remains (for existing code)
export async function POST(req: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 500 });

  const { text, voiceId = "8jMNCczgLGJQ3uVTkRhG" } = await req.json();
  if (!text) return NextResponse.json({ error: "Missing 'text'" }, { status: 400 });

  const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
      Connection: "keep-alive",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_22050_32",
      latency_optimization_level: 4,
    }),
    // @ts-expect-error
    agent: keepAliveAgent,
  });

  if (!resp.ok) {
    const err = await resp.text();
    return NextResponse.json({ error: err }, { status: resp.status });
  }

  const readable = resp.body;
  return new Response(readable ?? (await resp.arrayBuffer()), {
    status: 200,
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}

// GET for audio element src usage
export async function GET(req: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 500 });

  const url = new URL(req.url);
  const text = url.searchParams.get("text");
  const voiceId = url.searchParams.get("voiceId") ?? "8jMNCczgLGJQ3uVTkRhG";
  if (!text) return NextResponse.json({ error: "Missing 'text' query" }, { status: 400 });

  const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
      Connection: "keep-alive",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_22050_32",
      latency_optimization_level: 4,
    }),
    // @ts-expect-error
    agent: keepAliveAgent,
  });

  if (!resp.ok) {
    const err = await resp.text();
    return NextResponse.json({ error: err }, { status: resp.status });
  }

  const readable = resp.body;
  return new Response(readable ?? (await resp.arrayBuffer()), {
    status: 200,
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}