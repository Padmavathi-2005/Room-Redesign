export type RoomType =
  | 'Living Room'
  | 'Bedroom'
  | 'Kids Room'
  | 'Kitchen'
  | 'Bathroom'
  | 'Dining Room'
  | 'Home Office'
  | 'Balcony'
  | 'Patio'
  | string;

export type DesignStyle =
  | 'Modern'
  | 'Luxury'
  | 'Minimalist'
  | 'Scandinavian'
  | 'Japandi'
  | 'Industrial'
  | 'Traditional'
  | 'Farmhouse'
  | 'Mediterranean'
  | 'Contemporary'
  | 'Bohemian'
  | 'Coastal'
  | 'Mid-Century Modern'
  | 'Art Deco'
  | string;

export type BudgetLevel = 'Budget' | 'Medium' | 'Luxury' | 'High-End' | string;

export type FurnitureHandling =
  | 'Keep Existing Furniture'
  | 'Replace All Furniture'
  | 'Replace Only Seating'
  | 'Replace Only Decorations'
  | 'Replace Furniture and Decor'
  | string;

export type AICreativityLevel = 'Low' | 'Medium' | 'High' | string;

export interface PromptEngineInput {
  roomType?: RoomType;
  designStyle?: DesignStyle;
  budget?: BudgetLevel;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  lighting?: string;
  furnitureHandling?: FurnitureHandling;
  aiCreativity?: AICreativityLevel;
  customInstructions?: string;
}

export interface SectionExplanation {
  quality: string;
  cameraPreservation: string;
  architecturePreservation: string;
  editableElements: string;
  style: string;
  colorPalette: string;
  materials: string;
  furnitureRules: string;
  lighting: string;
  decorations: string;
  renderingQuality: string;
  negativePrompt: string;
}

export interface PromptEngineOutput {
  positivePrompt: string;
  negativePrompt: string;
  explanation: SectionExplanation;
}

export interface IPromptModule {
  name: keyof SectionExplanation;
  generate(input: PromptEngineInput): string;
  explain(input: PromptEngineInput): string;
}
