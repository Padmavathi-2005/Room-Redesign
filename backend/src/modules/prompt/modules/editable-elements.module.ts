import { Injectable } from '@nestjs/common';
import { IPromptModule } from '../interfaces/prompt-module.interface';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';
import { DetailedSectionExplanationItem } from '../interfaces/prompt-output.interface';

@Injectable()
export class EditableElementsModule implements IPromptModule {
  readonly name = 'Editable Elements';
  readonly order = 50;

  generate(options: PromptInputOptions): string {
    return 'Allow modifications ONLY to non-structural editable elements: movable furniture, wall paint, wallpaper, curtains, rugs, decor, artwork, plants, lighting fixtures, accessories, movable shelves, table decorations, throw pillows, and blankets.';
  }

  explain(options: PromptInputOptions): DetailedSectionExplanationItem {
    return {
      sectionName: this.name,
      content: this.generate(options),
      generatedFrom: ['Editable Elements Rules'],
      purpose: 'Explicitly defines allowed surface finish and movable decor modifications while protecting load-bearing structures.',
    };
  }
}
