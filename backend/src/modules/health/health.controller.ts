import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    const rawKey = process.env.MANUS_API_KEYS || process.env.MANUS_API_KEY || '';
    const hasManusToken = !!(rawKey && rawKey.trim().replace(/^["']|["']$/g, '') !== '');

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'RoomAI Backend Service',
      manusApiTokenConfigured: hasManusToken,
      replicateApiTokenConfigured: hasManusToken, // Backwards compatibility for UI
      provider: hasManusToken ? 'Manus AI' : 'Demo Fallback',
      message: hasManusToken
        ? 'Manus API Key detected. Live Manus AI image generation active.'
        : 'MANUS_API_KEY is not configured in backend/.env. Running in sample fallback demo mode.',
    };
  }
}
