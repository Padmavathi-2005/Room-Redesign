import { Injectable } from '@nestjs/common';
import { IPromptModule } from '../interfaces/prompt-module.interface';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';
import { DetailedSectionExplanationItem } from '../interfaces/prompt-output.interface';
import { StyleFactory } from '../factories/style.factory';

@Injectable()
export class StyleModule implements IPromptModule {
  readonly name = 'Style';
  readonly order = 60;

  constructor(private readonly styleFactory: StyleFactory) {}

  generate(options: PromptInputOptions): string {
    const room = options.roomOptions?.roomType || options.roomType || 'Living Room';
    const styleName = options.styleOptions?.designStyle || options.designStyle || options.theme || 'Modern';
    const styleDesc = this.styleFactory.getStyleDescription(styleName as string);
    const sizeClause = options.roomOptions?.roomSize || options.roomSize ? `sized ${options.roomOptions?.roomSize || options.roomSize}` : '';

    return `a masterfully redesigned ${styleName.toLowerCase()} ${room.toLowerCase()} ${sizeClause}, featuring ${styleDesc}`.trim();
  }

  explain(options: PromptInputOptions): DetailedSectionExplanationItem {
    const styleName = options.styleOptions?.designStyle || options.designStyle || options.theme || 'Modern';
    const room = options.roomOptions?.roomType || options.roomType || 'Living Room';
    return {
      sectionName: this.name,
      content: this.generate(options),
      generatedFrom: ['designStyle', 'roomType', 'theme', 'mood'],
      purpose: `Controls furniture aesthetic, architectural details, and spatial styling matching ${styleName} ${room}.`,
    };
  }
}
