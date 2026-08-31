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

    const lines: string[] = [
      `8k UHD architectural interior redesign of a ${roomType} in ${style} style.`,
      `Theme features a ${color} palette with ${lighting} lighting.`,
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
