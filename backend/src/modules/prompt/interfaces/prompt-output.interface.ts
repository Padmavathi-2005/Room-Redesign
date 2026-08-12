export interface DetailedSectionExplanationItem {
  sectionName: string;
  content: string;
  generatedFrom: string[];
  purpose: string;
}

export type DetailedSectionExplanation = Record<string, DetailedSectionExplanationItem>;

export interface PromptOutputResult {
  finalPrompt: string;
  positivePrompt: string;
  negativePrompt: string;
  explanation: DetailedSectionExplanation;
}
