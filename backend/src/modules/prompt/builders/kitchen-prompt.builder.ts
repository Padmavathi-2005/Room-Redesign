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

    const subject = `a high-end luxury kitchen redesign in ${styleKey} architectural style`;
    const kitchenFeatures =
      'featuring custom seamless cabinetry, polished marble island countertop, pendant island lights, tile backsplash, built-in stainless steel appliances, under-cabinet warm LED lighting';
    const preservationClause =
      'preserve original kitchen window locations, door frames, and plumbing layout position, update cabinets countertops and finishes only';

    const colorClause = options.colorPalette ? `color palette of ${options.colorPalette}` : 'neutral oak and white marble tones';
    const userConstraints = userMsg ? `user requirements: ${userMsg}` : '';

    const finalPrompt = [
      COMMON_PHOTOGRAPHIC_BOOSTERS,
      subject,
      kitchenFeatures,
      preservationClause,
      colorClause,
      userConstraints,
    ]
      .filter(Boolean)
      .join(', ');

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, dirty stove, broken cabinets, missing countertops, floating appliances, removed kitchen window`;

    return { finalPrompt, negativePrompt };
  }
}
