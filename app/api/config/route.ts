import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

export async function GET() {
  try {
    // Local development - use env var
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID) {
      return Response.json({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID
      });
    }

    // Production - use Secrets Manager
    const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });
    const command = new GetSecretValueCommand({
      SecretId: "elevenlabs-config"
    });
    
    const result = await client.send(command);
    const config = JSON.parse(result.SecretString!);
    
    return Response.json({
      agentId: config.agentId
    });
  } catch (error) {
    console.error('Error fetching agent ID:', error);
    return Response.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}
