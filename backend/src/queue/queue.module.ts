import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomGeneration, RoomSchema } from '../rooms/schemas/room.schema';
import { QueueWorkerService } from './queue-worker.service';
import { PromptModule } from '../modules/prompt/prompt.module';
import { UploadsModule } from '../modules/uploads/uploads.module';
import { ProviderManagerModule } from '../modules/provider-manager/provider-manager.module';
import { StorageModule } from '../modules/storage/storage.module';
import { ProjectsModule } from '../modules/projects/projects.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RoomGeneration.name, schema: RoomSchema }]),
    PromptModule,
    UploadsModule,
    ProviderManagerModule,
    StorageModule,
    ProjectsModule,
  ],
  providers: [QueueWorkerService],
  exports: [QueueWorkerService],
})
export class QueueModule {}
