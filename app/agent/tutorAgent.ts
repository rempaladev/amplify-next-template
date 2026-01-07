import { RealtimeAgent } from '@openai/agents/realtime'


export const tutorAgent = new RealtimeAgent({
    name: 'chatAgent',
    voice: 'sage'
});