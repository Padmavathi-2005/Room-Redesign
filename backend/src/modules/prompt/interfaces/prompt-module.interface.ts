import { PromptInputOptions } from './prompt-input.interface';
import { DetailedSectionExplanationItem } from './prompt-output.interface';

export interface IPromptModule {
  name: string;
  order: number;
  generate(options: PromptInputOptions): string;
  explain(options: PromptInputOptions): DetailedSectionExplanationItem;
}
