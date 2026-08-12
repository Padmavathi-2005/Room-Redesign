import { Injectable } from '@nestjs/common';
import { IPromptModule } from '../interfaces/prompt-module.interface';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';
import { DetailedSectionExplanationItem } from '../interfaces/prompt-output.interface';
import { DecorationFactory } from '../factories/decoration.factory';

@Injectable()
export class DecorationsModule implements IPromptModule {
  readonly name = 'Decorations';
  readonly order = 110;

  constructor(private readonly decorationFactory: DecorationFactory) {}

  generate(options: PromptInputOptions): string {
    const custom = options.aiOptions?.customInstructions || options.customInstructions || options.customRequirements;
    const products = options.furnitureOptions?.selectedProducts || options.selectedProducts;

    return this.decorationFactory.getDecorDescription(custom, products);
  }

  explain(options: PromptInputOptions): DetailedSectionExplanationItem {
    return {
      sectionName: this.name,
      content: this.generate(options),
      generatedFrom: ['customInstructions', 'customRequirements', 'selectedProducts'],
      purpose: 'Incorporate style-matched wall art, potted plants, accessories, and user custom requirements.',
    };
  }
}
