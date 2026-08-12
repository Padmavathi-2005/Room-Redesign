import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ColorPalette, ColorPaletteSchema } from './schemas/color-palette.schema';
import { ColorPalettesService } from './color-palettes.service';
import { ColorPalettesController } from './color-palettes.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ColorPalette.name, schema: ColorPaletteSchema }]),
  ],
  controllers: [ColorPalettesController],
  providers: [ColorPalettesService],
  exports: [ColorPalettesService, MongooseModule],
})
export class ColorPalettesModule {}
