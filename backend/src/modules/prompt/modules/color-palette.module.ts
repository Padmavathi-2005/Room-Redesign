import { Injectable } from '@nestjs/common';
import { IPromptModule } from '../interfaces/prompt-module.interface';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';
import { DetailedSectionExplanationItem } from '../interfaces/prompt-output.interface';

@Injectable()
export class ColorPaletteModule implements IPromptModule {
  readonly name = 'Color Palette';
  readonly order = 70;

  generate(options: PromptInputOptions): string {
    const primary = options.colorOptions?.primaryColor || options.primaryColor || options.colorPalette || 'warm neutral cream';
    const secondary = options.colorOptions?.secondaryColor || options.secondaryColor || 'soft beige';
    const accent = options.colorOptions?.accentColor || options.accentColor || 'natural earth tones';

    return `harmonious color palette anchored by primary ${primary.toLowerCase()}, balanced with secondary ${secondary.toLowerCase()}, and subtle accent touches of ${accent.toLowerCase()}`;
  }

  explain(options: PromptInputOptions): DetailedSectionExplanationItem {
    const primary = options.colorOptions?.primaryColor || options.primaryColor || options.colorPalette || 'cream';
    const secondary = options.colorOptions?.secondaryColor || options.secondaryColor || 'beige';
    const accent = options.colorOptions?.accentColor || options.accentColor || 'earth tones';
    return {
      sectionName: this.name,
      content: this.generate(options),
      generatedFrom: ['primaryColor', 'secondaryColor', 'accentColor', 'colorPalette'],
      purpose: `Enforces strict color harmony balancing primary (${primary}), secondary (${secondary}), and accent (${accent}) tones.`,
    };
  }
}
