import { Injectable } from '@nestjs/common';
import { IPromptBuilder, PromptInputOptions, PromptOutputResult } from './base-prompt.builder';
import { PromptEngineService } from '../engine/prompt-engine.service';
import { RoomTypeEnum } from '../enums/room-type.enum';
import { DesignStyleEnum } from '../enums/design-style.enum';

@Injectable()
export class InteriorPromptBuilder implements IPromptBuilder {
  constructor(private readonly promptEngine: PromptEngineService = new PromptEngineService()) {}

  build(options: PromptInputOptions): PromptOutputResult {
    // Construct grouped options object if passed as flat properties
    const input: PromptInputOptions = {
      analysis: options.analysis,
      roomOptions: options.roomOptions || {
        roomType: options.roomType || RoomTypeEnum.LIVING_ROOM,
        roomSize: options.roomSize,
      },
      styleOptions: options.styleOptions || {
        designStyle: options.designStyle || options.theme || DesignStyleEnum.MODERN,
        theme: options.theme,
        mood: options.mood,
      },
      colorOptions: options.colorOptions || {
        primaryColor: options.primaryColor || options.colorPalette || 'warm cream',
        secondaryColor: options.secondaryColor || 'soft beige',
        accentColor: options.accentColor || 'natural earth tones',
        colorPalette: options.colorPalette,
      },
      furnitureOptions: options.furnitureOptions || {
        furnitureHandling: options.furnitureHandling || 'Replace All Furniture',
        selectedProducts: options.selectedProducts,
      },
      lightingOptions: options.lightingOptions || {
        lighting: options.lighting || 'Bright Daylight',
        timeOfDay: options.timeOfDay,
        environment: options.environment,
      },
      preservationOptions: options.preservationOptions || {
        preserveWalls: true,
        preserveWindows: true,
        preserveDoors: true,
        preserveCeiling: true,
        preserveStructure: options.preserveStructure !== false,
      },
      renderingOptions: options.renderingOptions || {
        renderQuality: 'Photorealistic 8K UHD',
      },
      aiOptions: options.aiOptions || {
        aiCreativity: options.aiIntervention || 'Medium',
        toolSlug: options.toolSlug || 'interior-design',
        customInstructions: options.customRequirements || options.customInstructions,
      },
      materialPreference: options.materialPreference,
      budgetLevel: options.budgetLevel || options.budget,
    };

    return this.promptEngine.generatePrompt(input);
  }
}
