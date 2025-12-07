import { NextResponse } from "next/server";

export async function GET() {

console.log("ElevenLabs Scribe Token Route Invoked");

  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error("ELEVENLABS_API_KEY is missing");
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    console.log("ELEVENLABS_API_KEY found, proceeding to fetch token...");

    const response = await fetch(
      "https://api.elevenlabs.io/v1/single-use-token/realtime_scribe",
      {
        method: "POST",
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "xi-api-key": apiKey, // ensure string
        },
        body: JSON.stringify({}), // POST requires a body; empty object is fine
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("ElevenLabs token error:", response.status, text);
      return NextResponse.json(
        { error: "Failed to fetch token" },
        { status: response.status }
      );
    }

    console.log("Token fetched successfully");
    const data = await response.json();
    return NextResponse.json({ token: data.token });
  } catch (error) {
    console.error("Error fetching token:", error);
    return NextResponse.json({ error: "Failed to fetch token" }, { status: 500 });
  }
}