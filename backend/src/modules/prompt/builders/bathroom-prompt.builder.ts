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

    const subject = `a peaceful luxury bathroom spa retreat redesign in ${styleKey} aesthetic`;
    const bathroomFeatures =
      'frameless walk-in glass shower, marble floating vanity, brass fixtures, large backlit LED mirror, ceramic tile walls, radiant non-slip floor';
    const preservationClause =
      'preserve original window and door positions, retain plumbing layout boundaries, update tiles fixtures and vanity design only';

    const colorClause = options.colorPalette ? `color scheme of ${options.colorPalette}` : 'calming neutral beige and white marble';
    const userConstraints = userMsg ? `user requirements: ${userMsg}` : '';

    const finalPrompt = [
      COMMON_PHOTOGRAPHIC_BOOSTERS,
      subject,
      bathroomFeatures,
      preservationClause,
      colorClause,
      userConstraints,
    ]
      .filter(Boolean)
      .join(', ');

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, broken glass, dirty tiles, rusty fixtures, removed window, distorted shower enclosure`;

    return { finalPrompt, negativePrompt };
  }
}
