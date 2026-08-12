import { IPromptBuilder, PromptOutputResult, COMMON_PHOTOGRAPHIC_BOOSTERS, COMMON_NEGATIVE_PROMPT } from './base-prompt.builder';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';

/**
 * Dedicated Prompt Builder for AI Room Cleaner & Declutter Tool
 */
export class CleanerPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const intensity = options.aiIntervention || 'Deep Clean';
    const customInstructions = options.customInstructions ? `, ${options.customInstructions}` : '';

    const finalPrompt = `Architectural decluttering and room cleaning transformation, ${intensity} decluttering, pristine spotless interior, completely organized space, remove trash clutter and unwanted mess, tidy pristine surfaces, elegant staging${customInstructions}, ${COMMON_PHOTOGRAPHIC_BOOSTERS}`;

    return {
      finalPrompt,
      negativePrompt: `${COMMON_NEGATIVE_PROMPT}, clutter, trash, mess, dirty floor, scattered items, dislocated furniture`,
    };
  }
}
