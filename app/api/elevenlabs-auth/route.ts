import { NextResponse } from 'next/server';

export async function GET() {
  console.log("Received request for ElevenLabs conversation token");
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  if (!agentId) {
    return NextResponse.json({ error: 'Agent ID not configured' }, { status: 500 });
  }

  const tokenUrl = `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`;

  try {
    console.log("Fetching conversation token from ElevenLabs API...");
    const response = await fetch(tokenUrl, {
      method: 'GET',
      headers: {
        'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);  // { conversation_token: "your-token-string" }
  } catch (error) {
    console.error('Error fetching conversation token:', error);
    return NextResponse.json({ error: 'Failed to get conversation token' }, { status: 500 });
  }
}