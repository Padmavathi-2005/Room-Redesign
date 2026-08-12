import { Injectable } from '@nestjs/common';
import { IPromptModule } from '../interfaces/prompt-module.interface';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';
import { DetailedSectionExplanationItem } from '../interfaces/prompt-output.interface';
import { MaterialFactory } from '../factories/material.factory';

@Injectable()
export class MaterialsModule implements IPromptModule {
  readonly name = 'Materials';
  readonly order = 80;

  constructor(private readonly materialFactory: MaterialFactory) {}

  generate(options: PromptInputOptions): string {
    const style = options.styleOptions?.designStyle || options.designStyle || options.theme;
    const userPref = options.materialPreference;
    const budget = options.budgetLevel || options.budget;

    return this.materialFactory.getMaterials(style as string, userPref, budget as string);
  }

  explain(options: PromptInputOptions): DetailedSectionExplanationItem {
    return {
      sectionName: this.name,
      content: this.generate(options),
      generatedFrom: ['materialPreference', 'designStyle', 'budgetLevel'],
      purpose: 'Dynamically selects surface textures, wood species, stonework, and fabric weaves matching style and budget preferences.',
    };
  }
}
