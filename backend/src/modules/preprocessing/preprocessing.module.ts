import { Module } from '@nestjs/common';
import { PreprocessingService } from './preprocessing.service';

@Module({
  providers: [PreprocessingService],
  exports: [PreprocessingService],
})
export class PreprocessingModule {}
