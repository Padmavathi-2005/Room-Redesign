import { IPromptBuilder, PromptOutputResult, COMMON_PHOTOGRAPHIC_BOOSTERS, COMMON_NEGATIVE_PROMPT } from './base-prompt.builder';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';

/**
 * Dedicated Prompt Builder for Paint Color Visualizer Tool
 */
export class PaintColorPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const color = options.colorPalette || options.primaryColor || 'Sage Green';
    const finish = options.mood || 'Matte';
    const wallTarget = options.buildingType || 'accent feature wall';

    const finalPrompt = `Architectural wall repaint visualization, repainting ${wallTarget} in ${color} paint color with ${finish} finish, flawless smooth wall texture, uniform coat of paint, professional interior painting, ${COMMON_PHOTOGRAPHIC_BOOSTERS}`;

    return {
      finalPrompt,
      negativePrompt: `${COMMON_NEGATIVE_PROMPT}, peeling paint, uneven paint drips, splotchy walls, unpainted patches`,
    };
  }
}
