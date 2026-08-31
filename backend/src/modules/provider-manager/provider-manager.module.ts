import { Module } from '@nestjs/common';
import { ProviderManagerService } from './provider-manager.service';
import { ManusProvider } from './providers/manus.provider';
import { RoomWhizProvider } from './providers/roomwhiz.provider';
import { VertexAiProvider } from './providers/vertex-ai.provider';
import { FallbackStudioProvider } from './providers/fallback-studio.provider';
import { OpenAiProvider } from './providers/openai.provider';

@Module({
  providers: [
    ProviderManagerService,
    VertexAiProvider,
    RoomWhizProvider,
    ManusProvider,
    FallbackStudioProvider,
    OpenAiProvider,
  ],
  exports: [ProviderManagerService, VertexAiProvider, RoomWhizProvider, ManusProvider, FallbackStudioProvider, OpenAiProvider],
})
export class ProviderManagerModule {}

