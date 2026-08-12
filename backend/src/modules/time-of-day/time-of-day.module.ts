import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimeOfDay, TimeOfDaySchema } from './schemas/time-of-day.schema';
import { TimeOfDayService } from './time-of-day.service';
import { TimeOfDayController } from './time-of-day.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TimeOfDay.name, schema: TimeOfDaySchema }]),
  ],
  controllers: [TimeOfDayController],
  providers: [TimeOfDayService],
  exports: [TimeOfDayService, MongooseModule],
})
export class TimeOfDayModule {}
