import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mood, MoodSchema } from './schemas/mood.schema';
import { MoodsService } from './moods.service';
import { MoodsController } from './moods.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mood.name, schema: MoodSchema }]),
  ],
  controllers: [MoodsController],
  providers: [MoodsService],
  exports: [MoodsService, MongooseModule],
})
export class MoodsModule {}
