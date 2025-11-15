// lib/config.ts
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

export async function getAgentId(): Promise<string> {
  // Local development - use env var
  console.log("Fetching the current env" + process.env.NODE_ENV);
  console.log("my agentId " + process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID);
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID) {
    return process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  }

  // Production - use Parameter Store
  const ssm = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' });
  const command = new GetParameterCommand({
    Name: "/myapp/elevenlabs/agent-id",
    WithDecryption: true
  });
  
  const result = await ssm.send(command);
  return result.Parameter?.Value || '';
}
