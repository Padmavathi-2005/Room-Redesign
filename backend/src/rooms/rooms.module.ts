import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RoomGeneration, RoomSchema } from './schemas/room.schema';
import { PromptModule } from '../modules/prompt/prompt.module';
import { UploadsModule } from '../modules/uploads/uploads.module';
import { ProviderManagerModule } from '../modules/provider-manager/provider-manager.module';
import { ProjectsModule } from '../modules/projects/projects.module';
import { UsersModule } from '../modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RoomGeneration.name, schema: RoomSchema }]),
    PromptModule,
    UploadsModule,
    ProviderManagerModule,
    ProjectsModule,
    UsersModule,
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
