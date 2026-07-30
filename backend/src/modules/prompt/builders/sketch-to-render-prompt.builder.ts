import { Injectable } from '@nestjs/common';
import {
  IPromptBuilder,
  PromptInputOptions,
  PromptOutputResult,
  COMMON_PHOTOGRAPHIC_BOOSTERS,
  COMMON_NEGATIVE_PROMPT,
} from './base-prompt.builder';

@Injectable()
export class SketchToRenderPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const style = options.designStyle || options.theme || 'Modern Glass Villa';
    const userMsg = options.customRequirements || options.customInstructions || '';

    const imageAnalysis =
      'extracting hand-drawn line weights, perspective vanishing points, structural wireframe outlines, and door/window CAD annotations';
    const preservationRule =
      'convert pencil line sketch directly into 8k photorealistic architectural building render; maintain exact building proportions and perspective geometry';

    const subject = `a high-end photorealistic 3D architectural render of a ${style} building based on CAD drawing lines`;
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

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, visible pencil lines on final render, sketchy paper texture, distorted vanishing points, cartoonish 3D`;

    return { finalPrompt, negativePrompt };
  }
}
