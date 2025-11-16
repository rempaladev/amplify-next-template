require('dotenv').config({ path: '.env.local' });  // Load .env.local

const { ElevenLabsClient } = require('elevenlabs');

const client = new ElevenLabsClient({
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY  // Match the env file
});

async function updateAllowlist(agentId) {
  try {
    const updated = await client.conversationalAi.updateAgent(agentId, {  // Correct method
      platformSettings: {
        auth: {
          enableAuth: true,
          allowlist: [
            { hostname: 'localhost' },
            { hostname: '127.0.0.1' },
          ],
        },
      },
    });
    console.log('Updated successfully:', updated.id);
  } catch (error) {
    console.error('Update failed:', error);
  }
}

updateAllowlist(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID);  // Match the env file