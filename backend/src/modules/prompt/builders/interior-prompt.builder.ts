import { Injectable } from '@nestjs/common';
import { IPromptBuilder, PromptInputOptions, PromptOutputResult } from './base-prompt.builder';

@Injectable()
export class InteriorPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const roomType = options.roomType || options.roomOptions?.roomType || 'Living Room';
    const style = options.designStyle || options.theme || options.styleOptions?.designStyle || 'Modern';
    const color = options.colorPalette || options.primaryColor || options.colorOptions?.colorPalette || 'Warm Cream & Neutral Tones';
    const lighting = options.lighting || options.lightingOptions?.lighting || 'Bright Ambient Daylight';
    const userCustom = options.customInstructions || options.customRequirements || '';

    // Selected products & furniture inclusions
    const prods = options.selectedProducts || options.furnitureOptions?.selectedProducts || [];
    const furnitureMode = options.furnitureHandling || options.furnitureOptions?.furnitureHandling;
    const budget = options.budgetLevel || options.budget;

    const details: string[] = [];
    if (prods && prods.length > 0) {
      details.push(`Selected furniture and decor items to include: ${prods.join(', ')}.`);
    }
    if (furnitureMode) {
      const modeText =
        furnitureMode === 'replace-all' || furnitureMode === 'replace-everything'
          ? 'Replace all existing furniture with newly styled pieces.'
          : furnitureMode === 'keep-all' || furnitureMode === 'reuse-everything'
          ? 'Reuse and preserve existing furniture layout.'
          : furnitureMode === 'replace-damaged'
          ? 'Replace only damaged furniture while retaining main elements.'
          : `Furniture handling: ${furnitureMode}.`;
      details.push(modeText);
    }
    if (budget) {
      details.push(`Budget tier: ${budget}.`);
    }

    const lines: string[] = [
      `8k UHD architectural interior redesign of a ${roomType} in ${style} style.`,
      `Theme features a ${color} palette with ${lighting} lighting.`,
      details.join(' '),
      userCustom ? `User requirements: ${userCustom.trim()}.` : '',
      `Preserve original camera angle, wall structure, windows, and door placement.`
    ].filter(Boolean);

    const positivePrompt = lines.join(' ');
    const negativePrompt = 'low quality, blurry, distorted architecture, extra walls, crooked windows, bad proportions';

    return {
      finalPrompt: positivePrompt,
      negativePrompt,
    };
  }
}
