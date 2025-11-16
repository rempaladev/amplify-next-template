import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { NextResponse } from 'next/server';

const ElevenLabsApiKeySecretId = 'elevenlabs-api-key';
const ElevenLabsAgentIdSecretId = 'elevenlabs-config';

async function getAgentId(secretId: string): Promise<string> {

 if (process.env.NODE_ENV === 'development') {
    // Local Development - use environment variable
    console.log("Using local environment variable for secretId: " + secretId);
    if(secretId === ElevenLabsApiKeySecretId) {
      return process.env.ELEVENLABS_API_KEY || '';
    }
    return process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '';
  }else{
    // Production - fetch from AWS Secrets Manager
    try {
      console.log("Calling Secrets Manager for secretId: " + secretId);
      const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });
      const command = new GetSecretValueCommand({
        SecretId: secretId
      });
      
      const result = await client.send(command);
      console.log("Successfully retrieved secret: " + result.SecretString);
      const config = JSON.parse(result.SecretString!);
      console.log("Parsed secret config: " + JSON.stringify(config));
      return config.agentId || config.ELEVENLABS_API_KEY || '';
    } catch (error) {
      console.error("Error fetching secret:", error);
      throw error;
    }
  }
}

export async function GET() {

  console.log("Received request for ElevenLabs conversation token");
  const agentId = await getAgentId(ElevenLabsAgentIdSecretId);
  const apiKey = await getAgentId(ElevenLabsApiKeySecretId);

  if (!agentId) {
    return NextResponse.json({ error: 'Agent ID not configured' }, { status: 500 });
  }
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
  }

  const tokenUrl = `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`;

  try {
    console.log("Fetching conversation token from ElevenLabs API..." + apiKey);
    
    const response = await fetch(tokenUrl, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

  const data = await response.json();
  return NextResponse.json({ 
    conversation_token: data.conversation_token,
    agentId: agentId 
});
  } catch (error) {
    console.error('Error fetching conversation token:', error);
    return NextResponse.json({ error: 'Failed to get conversation token' }, { status: 500 });
  }
}