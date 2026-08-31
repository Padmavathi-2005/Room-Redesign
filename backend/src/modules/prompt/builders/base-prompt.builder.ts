import { RoomAnalysisResult } from '../../room-analysis/dto/room-analysis.dto';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';

export { PromptInputOptions };

export interface PromptOutputResult {
  finalPrompt: string;
  negativePrompt: string;
}

export interface IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult;
}

/**
 * High-definition Quality, Bright Lighting, and Vibrant Color Boosters
 */
export const COMMON_PHOTOGRAPHIC_BOOSTERS =
  '8k UHD professional architectural photo, bright natural daylight, crisp focus.';

/**
 * Strict Negative Prompt to avoid dark, dim, blurry, or dull renders
 */
export const COMMON_NEGATIVE_PROMPT =
  'dark, dim, blurry, low quality, distorted geometry';

