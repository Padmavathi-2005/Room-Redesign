import { Injectable } from '@nestjs/common';
import {
  IPromptBuilder,
  PromptInputOptions,
  PromptOutputResult,
  COMMON_PHOTOGRAPHIC_BOOSTERS,
  COMMON_NEGATIVE_PROMPT,
} from './base-prompt.builder';

@Injectable()
export class EditingPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const slug = options.toolSlug || 'paint-color-visualizer';
    const userMsg = options.customRequirements || options.customInstructions || '';
    const palette = options.colorPalette || 'warm beige';
    const lighting = options.lighting || 'golden hour sunset';

    let subject = `change wall paint color to ${palette} with smooth matte finish`;

    if (slug === 'change-sky') {
      subject = `replace exterior background sky with dramatic ${lighting} sunshine and soft clouds`;
    } else if (slug === 'change-room-light') {
      subject = `transform room lighting atmosphere to ${lighting} ambient warm glow`;
    } else if (slug === 'ai-room-cleaner') {
      subject = 'de-clutter and clean room interior, removing all stray boxes, mess, and trash to reveal pristine empty room space';
    } else if (slug === 'ai-flooring-design') {
      subject = `replace room floor material with high quality premium ${palette || 'herringbone oak hardwood'} flooring`;
    }

    const preservationClause = 'preserve all furniture locations, window openings, doors, and original room structural boundaries';
    const userConstraints = userMsg ? `user instructions: ${userMsg}` : '';

    const finalPrompt = [
      COMMON_PHOTOGRAPHIC_BOOSTERS,
      subject,
      preservationClause,
      userConstraints,
    ]
      .filter(Boolean)
      .join(', ');

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, altered furniture positions, removed windows, distorted wall edges, splotchy paint`;

    return { finalPrompt, negativePrompt };
  }
}
