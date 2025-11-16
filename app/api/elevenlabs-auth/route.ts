import { NextResponse } from 'next/server';

export async function GET() {
  const agentId = process.env.ELEVENLABS_AGENT_ID || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  console.log("Agent ID:", agentId ? 'Loaded' : 'Missing');
  console.log("API Key:", apiKey ? 'Loaded' : 'Missing');

  if (!agentId || !apiKey) {
    return NextResponse.json({ error: 'Configuration missing' }, { status: 500 });
  }

  const tokenUrl = `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`;

  try {
    console.log("Requesting token from ElevenLabs API...");
    const response = await fetch(tokenUrl, {
      headers: { 'xi-api-key': apiKey },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    console.log("Token received successfully.");

    const data = await response.json();
    return NextResponse.json({ 
      conversation_token: data.token,
      agentId: agentId 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to get token' }, { status: 500 });
  }
}
