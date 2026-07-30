import { Injectable } from '@nestjs/common';
import {
  IPromptBuilder,
  PromptInputOptions,
  PromptOutputResult,
  COMMON_PHOTOGRAPHIC_BOOSTERS,
  COMMON_NEGATIVE_PROMPT,
} from './base-prompt.builder';

@Injectable()
export class ExteriorDesignPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const style = options.designStyle || options.theme || 'Modern Glass Villa';
    const userMsg = options.customRequirements || options.customInstructions || '';

    const imageAnalysis =
      'analyzing facade structural lines, roofline geometry, main entrance placement, and window aperture grid';
    const preservationRule =
      'preserve original building silhouette, retains structural wall boundaries, door framing, and window grid geometry; update exterior facade materials, wood slat cladding, and architectural lighting only';

    const subject = `a high-end 8k architectural exterior photograph of a redesigned ${style} building facade`;
    const userConstraints = userMsg ? `incorporating user constraints: ${userMsg}` : '';

    const finalPrompt = [
      COMMON_PHOTOGRAPHIC_BOOSTERS,
      imageAnalysis,
      subject,
      preservationRule,
      userConstraints,
    ]
      .filter(Boolean)
      .join(', ');

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, collapsed building, warped windows, floating roof, distorted facade geometry, altered entrance placement`;

    return { finalPrompt, negativePrompt };
  }
}
