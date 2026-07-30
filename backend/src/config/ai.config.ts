import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  replicateToken: process.env.REPLICATE_API_TOKEN || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
}));
