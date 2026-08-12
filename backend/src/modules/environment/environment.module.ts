import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Environment, EnvironmentSchema } from './schemas/environment.schema';
import { EnvironmentService } from './environment.service';
import { EnvironmentController } from './environment.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Environment.name, schema: EnvironmentSchema }]),
  ],
  controllers: [EnvironmentController],
  providers: [EnvironmentService],
  exports: [EnvironmentService, MongooseModule],
})
export class EnvironmentModule {}
