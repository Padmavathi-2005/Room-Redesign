import { IPromptBuilder, PromptOutputResult, COMMON_PHOTOGRAPHIC_BOOSTERS, COMMON_NEGATIVE_PROMPT } from './base-prompt.builder';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';

/**
 * Dedicated Prompt Builder for AI Room Cleaner & Declutter Tool
 */
export class CleanerPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const intensity = options.aiIntervention || 'Deep Clean';
    const customInstructions = options.customInstructions ? ` User requirements: ${options.customInstructions}.` : '';

    const finalPrompt = `Architectural room cleaning and ${intensity} decluttering. Pristine spotless interior, completely organized space, all trash and mess removed.${customInstructions} ${COMMON_PHOTOGRAPHIC_BOOSTERS}`;

    return {
      finalPrompt,
      negativePrompt: `${COMMON_NEGATIVE_PROMPT}, clutter, trash, mess, dirty floor, scattered items, dislocated furniture`,
    };
  }
}
