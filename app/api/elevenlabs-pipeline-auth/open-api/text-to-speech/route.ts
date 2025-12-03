import { NextResponse } from "next/server";

// Ensure Node.js runtime (SDK requires Node APIs)
export const dynamic = "force-dynamic";

export async function POST(req: Request) {

    console.log("TTS Route Invoked with request body." + req.body);

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 500 });
    }

  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Missing 'text' in body" }, { status: 400 });
    }

    // Use REST API to avoid Node streams in App Router
    const resp = await fetch("https://api.elevenlabs.io/v1/text-to-speech/8jMNCczgLGJQ3uVTkRhG", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        output_format: "mp3_44100_128",
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("ElevenLabs TTS error:", resp.status, errText);
      return NextResponse.json({ error: "Failed to convert text to speech" }, { status: resp.status });
    }

    const audioArrayBuffer = await resp.arrayBuffer();

    return new Response(audioArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("TTS route error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}