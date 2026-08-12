import { Injectable } from '@nestjs/common';
import { IPromptModule } from '../interfaces/prompt-module.interface';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';
import { DetailedSectionExplanationItem } from '../interfaces/prompt-output.interface';

@Injectable()
export class QualityModule implements IPromptModule {
  readonly name = 'Quality';
  readonly order = 10;

  generate(options: PromptInputOptions): string {
    return 'award-winning architectural interior photograph, professional architectural digest showcase, 35mm prime lens shot';
  }

  explain(options: PromptInputOptions): DetailedSectionExplanationItem {
    return {
      sectionName: this.name,
      content: this.generate(options),
      generatedFrom: ['Baseline Quality Booster'],
      purpose: 'Establishes high-end architectural photography baseline and professional 35mm lens perspective.',
    };
  }
}
