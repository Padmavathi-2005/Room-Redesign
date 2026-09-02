import { RoomTypeEnum } from '../enums/room-type.enum';
import { DesignStyleEnum } from '../enums/design-style.enum';
import {
  BudgetLevelEnum,
  FurnitureHandlingEnum,
  LightingPreferenceEnum,
  AICreativityEnum,
  RenderQualityEnum,
  GenerationModeEnum,
} from '../enums/prompt-options.enums';
import { RoomAnalysisResult } from '../../room-analysis/dto/room-analysis.dto';

export interface RoomOptions {
  roomType?: RoomTypeEnum | string;
  roomSize?: string;
  buildingType?: string;
  roofType?: string;
}

export interface StyleOptions {
  designStyle?: DesignStyleEnum | string;
  theme?: string;
  mood?: string;
}

export interface ColorOptions {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  colorPalette?: string;
}

export interface FurnitureOptions {
  furnitureHandling?: FurnitureHandlingEnum | string;
  selectedProducts?: string[];
}

export interface LightingOptions {
  lighting?: LightingPreferenceEnum | string;
  timeOfDay?: string;
  environment?: string;
}

export interface PreservationOptions {
  preserveWalls?: boolean;
  preserveWindows?: boolean;
  preserveDoors?: boolean;
  preserveCeiling?: boolean;
  preserveBuiltIns?: boolean;
  preserveFloorPlan?: boolean;
  preservePerspective?: boolean;
  preserveCamera?: boolean;
  preserveStructure?: boolean;
}

export interface RenderingOptions {
  renderQuality?: RenderQualityEnum | string;
  generationMode?: GenerationModeEnum | string;
}

export interface AIOptions {
  aiCreativity?: AICreativityEnum | string;
  toolSlug?: string;
  customInstructions?: string;
}

export interface PromptInputOptions {
  roomOptions?: RoomOptions;
  styleOptions?: StyleOptions;
  colorOptions?: ColorOptions;
  furnitureOptions?: FurnitureOptions;
  lightingOptions?: LightingOptions;
  preservationOptions?: PreservationOptions;
  renderingOptions?: RenderingOptions;
  aiOptions?: AIOptions;
  materialPreference?: string[] | string;
  budgetLevel?: BudgetLevelEnum | string;

  // Backwards compatibility flat properties
  roomType?: string;
  designStyle?: string;
  theme?: string;
  roomSize?: string;
  colorPalette?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  lighting?: string;
  customInstructions?: string;
  customRequirements?: string;
  preserveStructure?: boolean;
  toolSlug?: string;
  houseAngle?: string;
  cameraAngle?: string;
  perspective?: string;
  buildingType?: string;
  roofType?: string;
  environment?: string;
  timeOfDay?: string;
  tool?: string;
  aiIntervention?: string;
  mood?: string;
  budget?: string;
  furnitureHandling?: string;
  selectedProducts?: string[];
  flooringMaterial?: string;
  flooringFinish?: string;
  flooringGrout?: string;
  imageUrl?: string;
  originalImage?: string;
  materials?: string[];
  domainScope?: string;
  designTheme?: Record<string, any>;
  analysis?: RoomAnalysisResult;
}
