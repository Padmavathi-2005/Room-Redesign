import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiTool, AiToolSchema } from './schemas/ai-tool.schema';
import { AiToolsService } from './ai-tools.service';
import { AiToolsController } from './ai-tools.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AiTool.name, schema: AiToolSchema }]),
  ],
  controllers: [AiToolsController],
  providers: [AiToolsService],
  exports: [AiToolsService, MongooseModule],
})
export class AiToolsModule {}
