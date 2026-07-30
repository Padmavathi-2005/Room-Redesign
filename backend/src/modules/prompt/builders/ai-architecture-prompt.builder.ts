import { Injectable } from '@nestjs/common';
import {
  IPromptBuilder,
  PromptInputOptions,
  PromptOutputResult,
  COMMON_PHOTOGRAPHIC_BOOSTERS,
  COMMON_NEGATIVE_PROMPT,
} from './base-prompt.builder';

@Injectable()
export class AiArchitecturePromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const style = options.designStyle || options.theme || 'Parametric Glass';
    const userMsg = options.customRequirements || options.customInstructions || '';

    const imageAnalysis =
      'analyzing structural massing volume, cantilever beam overhangs, facade grid modules, and structural load-bearing alignment';
    const preservationRule =
      'preserve core building volume and structural column grid; render futuristic exterior facade with curtain glass walls and steel lattice framing';

    const subject = `an iconic 8k architectural design of a ${style} landmark building with parametric structural elegance`;
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

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, structurally impossible beam, floating concrete, warped glass panels, broken facade grid`;

    return { finalPrompt, negativePrompt };
  }
}
