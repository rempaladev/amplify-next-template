import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  // Forward to OpenAI Transcriptions (Whisper)
  const upstreamForm = new FormData();
  upstreamForm.append("file", file, file.name);
  upstreamForm.append("model", "whisper-1");
  // Optional: language hint, response_format, temperature, etc.
  // upstreamForm.append("language", "en");

  const resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: upstreamForm,
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return NextResponse.json({ error: errText }, { status: resp.status });
  }

  const data = await resp.json();
  // OpenAI returns { text: "..." }
  return NextResponse.json({ text: data.text ?? "" });
}