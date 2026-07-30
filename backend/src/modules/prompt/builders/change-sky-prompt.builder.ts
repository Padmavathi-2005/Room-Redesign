import { Injectable } from '@nestjs/common';
import {
  IPromptBuilder,
  PromptInputOptions,
  PromptOutputResult,
  COMMON_PHOTOGRAPHIC_BOOSTERS,
  COMMON_NEGATIVE_PROMPT,
} from './base-prompt.builder';

@Injectable()
export class ChangeSkyPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const lighting = options.lighting || 'golden hour sunset';
    const userMsg = options.customRequirements || options.customInstructions || '';

    const imageAnalysis =
      'detecting horizon boundary line, roofline silhouette, tree canopy edges, and ambient daylight kelvin temperature';
    const preservationRule =
      'preserve 100% of building facade structure, trees, and ground foreground; swap sky segment only with seamless horizon blending';

    const subject = `replace sky background with dramatic ${lighting} featuring realistic cloud illumination and matched ambient lighting cast on building`;
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

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, halo artifacts around roofline, mismatched lighting shadows, oversaturated sky, fake clouds`;

    return { finalPrompt, negativePrompt };
  }
}
