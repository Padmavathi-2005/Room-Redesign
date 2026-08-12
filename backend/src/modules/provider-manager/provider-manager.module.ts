import { Module } from '@nestjs/common';
import { ProviderManagerService } from './provider-manager.service';
import { ManusProvider } from './providers/manus.provider';

@Module({
  providers: [
    ProviderManagerService,
    ManusProvider,
  ],
  exports: [ProviderManagerService, ManusProvider],
})
export class ProviderManagerModule {}

