import { Injectable } from '@nestjs/common';
import { IPromptModule } from '../interfaces/prompt-module.interface';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';
import { DetailedSectionExplanationItem } from '../interfaces/prompt-output.interface';
import { FurnitureHandlingEnum } from '../enums/prompt-options.enums';

@Injectable()
export class FurnitureRulesModule implements IPromptModule {
  readonly name = 'Furniture Rules';
  readonly order = 90;

  generate(options: PromptInputOptions): string {
    const rawHandling =
      options.furnitureOptions?.furnitureHandling ||
      options.furnitureHandling ||
      FurnitureHandlingEnum.REPLACE_ALL;
    const handling = String(rawHandling).toLowerCase();

    if (handling.includes('keep') || handling.includes('reuse')) {
      return 'strictly retain existing core furniture placement and key furniture pieces, updating only upholstery fabrics, surface colors, and accent decor';
    }
    if (handling.includes('seating')) {
      return 'replace only seating items with new style-tailored armchairs and sofas while preserving surrounding tables and structural arrangement';
    }
    if (handling.includes('decorations') || handling.includes('decor')) {
      return 'preserve main furniture layout and replace only decorative accessories, artwork, rugs, and soft textiles';
    }
    if (handling.includes('damaged')) {
      return 'selectively replace only damaged, worn-out, or outdated furniture items while maintaining overall spatial arrangement';
    }
    return 'completely replace all movable furniture items and decor with brand new high-end pieces matching the chosen design style, while keeping exact room layout geometry';
  }

  explain(options: PromptInputOptions): DetailedSectionExplanationItem {
    const handling =
      options.furnitureOptions?.furnitureHandling ||
      options.furnitureHandling ||
      FurnitureHandlingEnum.REPLACE_ALL;
    return {
      sectionName: this.name,
      content: this.generate(options),
      generatedFrom: ['furnitureHandling', 'furnitureOptions'],
      purpose: `Applies furniture strategy based on user selection (${handling}), cleanly distinguishing movable furniture from permanent architecture.`,
    };
  }
}
