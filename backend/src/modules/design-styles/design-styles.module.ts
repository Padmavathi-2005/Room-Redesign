import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DesignStyle, DesignStyleSchema } from './schemas/design-style.schema';
import { DesignStylesService } from './design-styles.service';
import { DesignStylesController } from './design-styles.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DesignStyle.name, schema: DesignStyleSchema }]),
  ],
  controllers: [DesignStylesController],
  providers: [DesignStylesService],
  exports: [DesignStylesService, MongooseModule],
})
export class DesignStylesModule {}
