import { Injectable } from '@nestjs/common';
import {
  IPromptBuilder,
  PromptInputOptions,
  PromptOutputResult,
  COMMON_PHOTOGRAPHIC_BOOSTERS,
  COMMON_NEGATIVE_PROMPT,
} from './base-prompt.builder';

@Injectable()
export class FloorPlanPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const is3D = options.toolSlug === '3d-floor-plan';
    const userMsg = options.customRequirements || options.customInstructions || '';

    let subject = 'a 2D architectural blueprint floor plan with clean wall thickness, door swing arcs, window openings, and room labels';
    if (is3D) {
      subject = 'an isometric 3D floor plan cutaway render featuring miniature furniture placement, oak flooring, soft lighting shadows, and clear room division';
    }

    const layoutDetails = 'precise scale, clear room boundaries, professional CAD architectural layout presentation';
    const userConstraints = userMsg ? `layout instructions: ${userMsg}` : '';

    const finalPrompt = [
      is3D ? COMMON_PHOTOGRAPHIC_BOOSTERS : 'high precision 2D architectural vector floor plan drawing',
      subject,
      layoutDetails,
      userConstraints,
    ]
      .filter(Boolean)
      .join(', ');

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, distorted lines, unreadable text, crooked walls, 3D clutter on 2D drawing, broken room boundaries`;

    return { finalPrompt, negativePrompt };
  }
}
