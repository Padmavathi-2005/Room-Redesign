import { Injectable } from '@nestjs/common';
import { IPromptModule } from '../interfaces/prompt-module.interface';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';
import { DetailedSectionExplanationItem } from '../interfaces/prompt-output.interface';
import { LightingFactory } from '../factories/lighting.factory';

@Injectable()
export class LightingModule implements IPromptModule {
  readonly name = 'Lighting';
  readonly order = 100;

  constructor(private readonly lightingFactory: LightingFactory) {}

  generate(options: PromptInputOptions): string {
    const lighting = options.lightingOptions?.lighting || options.lighting;
    const timeOfDay = options.lightingOptions?.timeOfDay || options.timeOfDay;

    return this.lightingFactory.getLightingDescription(lighting as string, timeOfDay as string);
  }

  explain(options: PromptInputOptions): DetailedSectionExplanationItem {
    const lighting = options.lightingOptions?.lighting || options.lighting || 'Bright Daylight';
    return {
      sectionName: this.name,
      content: this.generate(options),
      generatedFrom: ['lighting', 'timeOfDay', 'lightingOptions'],
      purpose: `Configures ambient light temperature, shadows, and light fixture glow matching preference (${lighting}).`,
    };
  }
}
