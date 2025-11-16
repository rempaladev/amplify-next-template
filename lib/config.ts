// lib/config.ts
export async function getAgentId(): Promise<string> {
  // Local development - use env var

  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '';
  }

  // Production - call API route
  try {
    const response = await fetch('/api/config');
    const data = await response.json();
    return data.agentId || '';
  } catch (error) {
    console.error('Error fetching agent ID:', error);
    return '';
  }
}
