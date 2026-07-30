import { Injectable } from '@nestjs/common';
import {
  IPromptBuilder,
  PromptInputOptions,
  PromptOutputResult,
  COMMON_PHOTOGRAPHIC_BOOSTERS,
  COMMON_NEGATIVE_PROMPT,
} from './base-prompt.builder';

@Injectable()
export class ExteriorPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const styleKey = (options.designStyle || options.theme || 'Modern Glass Villa').toLowerCase();
    const isLandscape = options.toolSlug === 'landscape-design' || options.toolSlug === 'garden-design';
    const isSketch = options.toolSlug === 'sketch-to-render';
    const userMsg = options.customRequirements || options.customInstructions || '';

    let subject = `a high-end architectural exterior redesign of a ${styleKey} villa building facade`;
    if (isLandscape) {
      subject = `a luxury landscape garden design in ${styleKey} style with stone pathways, manicured lawn, resort patio, and outdoor lighting`;
    } else if (isSketch) {
      subject = `an 8k photorealistic architectural 3D building render converted from hand-drawn CAD line sketch`;
    }

    const architecturalDetails =
      'contemporary glass windows, warm wood slat cladding, stone accent walls, ambient facade spotlights, blue sky with soft sunshine';
    const userConstraints = userMsg ? `user specifications: ${userMsg}` : '';

    const finalPrompt = [
      COMMON_PHOTOGRAPHIC_BOOSTERS,
      subject,
      architecturalDetails,
      userConstraints,
    ]
      .filter(Boolean)
      .join(', ');

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, collapsed building, warped windows, blurry trees, ugly sky, distorted facade geometry`;

    return { finalPrompt, negativePrompt };
  }
}
