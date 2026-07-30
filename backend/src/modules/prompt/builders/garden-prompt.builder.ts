import { Injectable } from '@nestjs/common';
import {
  IPromptBuilder,
  PromptInputOptions,
  PromptOutputResult,
  COMMON_PHOTOGRAPHIC_BOOSTERS,
  COMMON_NEGATIVE_PROMPT,
} from './base-prompt.builder';

@Injectable()
export class GardenPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const style = options.designStyle || options.theme || 'Zen Courtyard';
    const userMsg = options.customRequirements || options.customInstructions || '';

    const imageAnalysis =
      'analyzing courtyard boundaries, planter bed contours, central fountain position, and sun exposure angles';
    const preservationRule =
      'preserve courtyard structural enclosure walls and main door entrance; redesign floral flower beds, Japanese maple trees, gravel paths, and teak seating';

    const subject = `a serene tranquil garden design in ${style} aesthetic with flowering plants, stone lanterns, and natural wood benches`;
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

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, withered plants, barren dirt, chaotic debris, distorted seating, broken stone lanterns`;

    return { finalPrompt, negativePrompt };
  }
}
