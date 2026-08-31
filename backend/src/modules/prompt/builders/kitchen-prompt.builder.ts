import { Injectable } from '@nestjs/common';
import {
  IPromptBuilder,
  PromptInputOptions,
  PromptOutputResult,
  COMMON_PHOTOGRAPHIC_BOOSTERS,
  COMMON_NEGATIVE_PROMPT,
} from './base-prompt.builder';

@Injectable()
export class KitchenPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const styleKey = (options.designStyle || options.theme || 'Modern').toLowerCase();
    const userMsg = options.customRequirements || options.customInstructions || '';

    const subject = `8k UHD photo of a kitchen redesign in ${styleKey} style.`;
    const kitchenFeatures = `Features ${options.colorPalette || 'neutral oak and white marble tones'} palette, custom cabinetry, marble countertops, and warm LED lighting.`;
    const preservationClause = `Preserve original windows, door frames, and plumbing positions, updating cabinets and finishes only.`;
    const userConstraints = userMsg ? `User requirements: ${userMsg}.` : '';

    const finalPrompt = [
      subject,
      kitchenFeatures,
      preservationClause,
      userConstraints,
      COMMON_PHOTOGRAPHIC_BOOSTERS
    ]
      .filter(Boolean)
      .join(' ');

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, dirty stove, broken cabinets, missing countertops, floating appliances, removed kitchen window`;

    return { finalPrompt, negativePrompt };
  }
}
