import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RoomGeneration, RoomSchema } from './schemas/room.schema';
import { PromptModule } from '../modules/prompt/prompt.module';
import { UploadsModule } from '../modules/uploads/uploads.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RoomGeneration.name, schema: RoomSchema }]),
    PromptModule,
    UploadsModule,
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
