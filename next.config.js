/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ELEVENLABS_AGENT_ID: process.env.ELEVENLABS_AGENT_ID,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  }
}

module.exports = nextConfig