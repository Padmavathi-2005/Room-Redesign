import { Injectable } from '@nestjs/common';
import {
  IPromptBuilder,
  PromptInputOptions,
  PromptOutputResult,
  COMMON_NEGATIVE_PROMPT,
} from './base-prompt.builder';

@Injectable()
export class AiBlueprintPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const userMsg = options.customRequirements || options.customInstructions || '';

    const imageAnalysis =
      'analyzing technical wall thickness, door swing radius arcs, dimension callout lines, and room elevation markers';
    const preservationRule =
      'convert layout into a high-precision architectural CAD blueprint schematic drawing on blue grid engineering paper';

    const subject =
      'a professional technical architectural blueprint with white vector lines, elevation markers, wall thickness, and precise room dimension callouts';
    const userConstraints = userMsg ? `blueprint instructions: ${userMsg}` : '';

    const finalPrompt = [
      'high-precision 2D technical architectural CAD blueprint schematic',
      imageAnalysis,
      subject,
      preservationRule,
      userConstraints,
    ]
      .filter(Boolean)
      .join(', ');

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, 3D shading, realistic furniture textures, photo render, blurry line work, unreadable technical dimensions`;

    return { finalPrompt, negativePrompt };
  }
}
