import { Injectable } from '@nestjs/common';
import {
  IPromptBuilder,
  PromptInputOptions,
  PromptOutputResult,
  COMMON_PHOTOGRAPHIC_BOOSTERS,
  COMMON_NEGATIVE_PROMPT,
} from './base-prompt.builder';

@Injectable()
export class BathroomPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const styleKey = (options.designStyle || options.theme || 'Modern Spa').toLowerCase();
    const userMsg = options.customRequirements || options.customInstructions || '';

    const subject = `8k UHD photo of a bathroom redesign in ${styleKey} style.`;
    const bathroomFeatures = `Features ${options.colorPalette || 'calming neutral beige and white marble'} palette, frameless glass shower, marble vanity, and clean tiling.`;
    const preservationClause = `Preserve original window and door placement, updating only fixtures, tiles, and vanity design.`;
    const userConstraints = userMsg ? `User requirements: ${userMsg}.` : '';

    const finalPrompt = [
      subject,
      bathroomFeatures,
      preservationClause,
      userConstraints,
      COMMON_PHOTOGRAPHIC_BOOSTERS
    ]
      .filter(Boolean)
      .join(' ');

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, broken glass, dirty tiles, rusty fixtures, removed window, distorted shower enclosure`;

    return { finalPrompt, negativePrompt };
  }
}
