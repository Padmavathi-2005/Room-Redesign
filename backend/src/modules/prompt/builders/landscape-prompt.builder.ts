import { Injectable } from '@nestjs/common';
import {
  IPromptBuilder,
  PromptInputOptions,
  PromptOutputResult,
  COMMON_PHOTOGRAPHIC_BOOSTERS,
  COMMON_NEGATIVE_PROMPT,
} from './base-prompt.builder';

@Injectable()
export class LandscapePromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const style = options.designStyle || options.theme || 'Modern Lawn Resort';
    const userMsg = options.customRequirements || options.customInstructions || '';

    const imageAnalysis =
      'analyzing ground slope topography, property boundary lines, patio perimeter, and outdoor pathway trajectories';
    const preservationRule =
      'retain main building boundary and property fences; redesign lawn grass, stone stepping pathways, pergolas, and landscape lighting';

    const subject = `a luxury landscape garden design in ${style} aesthetic with lush greenery, stone pavers, and warm outdoor ambient lights`;
    const userConstraints = userMsg ? `user specifications: ${userMsg}` : '';

    const finalPrompt = [
      COMMON_PHOTOGRAPHIC_BOOSTERS,
      imageAnalysis,
      subject,
      preservationRule,
      userConstraints,
    ]
      .filter(Boolean)
      .join(', ');

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, dead grass, messy weeds, distorted stone paving, floating pergola, ruined building facade`;

    return { finalPrompt, negativePrompt };
  }
}
