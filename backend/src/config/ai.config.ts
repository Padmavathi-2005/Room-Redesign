import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  manusApiKey: process.env.MANUS_API_KEY || '',
}));

