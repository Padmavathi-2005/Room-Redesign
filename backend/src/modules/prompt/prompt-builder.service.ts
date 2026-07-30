import { Injectable } from '@nestjs/common';
import { PromptInputOptions, PromptOutputResult } from './builders/base-prompt.builder';
import { InteriorPromptBuilder } from './builders/interior-prompt.builder';
import { KitchenPromptBuilder } from './builders/kitchen-prompt.builder';
import { BathroomPromptBuilder } from './builders/bathroom-prompt.builder';
import { FloorPlanPromptBuilder } from './builders/floorplan-prompt.builder';
import { ExteriorDesignPromptBuilder } from './builders/exterior-design-prompt.builder';
import { LandscapePromptBuilder } from './builders/landscape-prompt.builder';
import { GardenPromptBuilder } from './builders/garden-prompt.builder';
import { ChangeSkyPromptBuilder } from './builders/change-sky-prompt.builder';
import { SketchToRenderPromptBuilder } from './builders/sketch-to-render-prompt.builder';
import { AiArchitecturePromptBuilder } from './builders/ai-architecture-prompt.builder';
import { AiBlueprintPromptBuilder } from './builders/ai-blueprint-prompt.builder';
import { EditingPromptBuilder } from './builders/editing-prompt.builder';

@Injectable()
export class PromptBuilderService {
  private readonly interiorBuilder = new InteriorPromptBuilder();
  private readonly kitchenBuilder = new KitchenPromptBuilder();
  private readonly bathroomBuilder = new BathroomPromptBuilder();
  private readonly floorPlanBuilder = new FloorPlanPromptBuilder();
  
  // Dedicated Exterior Tool Builders
  private readonly exteriorDesignBuilder = new ExteriorDesignPromptBuilder();
  private readonly landscapeBuilder = new LandscapePromptBuilder();
  private readonly gardenBuilder = new GardenPromptBuilder();
  private readonly changeSkyBuilder = new ChangeSkyPromptBuilder();
  private readonly sketchToRenderBuilder = new SketchToRenderPromptBuilder();
  private readonly aiArchitectureBuilder = new AiArchitecturePromptBuilder();
  private readonly aiBlueprintBuilder = new AiBlueprintPromptBuilder();

  private readonly editingBuilder = new EditingPromptBuilder();

  /**
   * Master Strategy Factory: Routes request to the dedicated individual tool builder file
   */
  buildPrompt(options: PromptInputOptions): PromptOutputResult {
    const slug = (options.toolSlug || 'interior-design').toLowerCase();

    // 1. Dedicated Exterior Builders
    if (slug === 'exterior-design') {
      return this.exteriorDesignBuilder.build(options);
    }
    if (slug === 'landscape-design') {
      return this.landscapeBuilder.build(options);
    }
    if (slug === 'garden-design') {
      return this.gardenBuilder.build(options);
    }
    if (slug === 'change-sky') {
      return this.changeSkyBuilder.build(options);
    }
    if (slug === 'sketch-to-render') {
      return this.sketchToRenderBuilder.build(options);
    }
    if (slug === 'ai-architecture-generator') {
      return this.aiArchitectureBuilder.build(options);
    }
    if (slug === 'ai-blueprint-generator') {
      return this.aiBlueprintBuilder.build(options);
    }

    // 2. Specialized Interior & Floor Plan Builders
    if (slug === 'kitchen-design') {
      return this.kitchenBuilder.build(options);
    }
    if (slug === 'bathroom-design') {
      return this.bathroomBuilder.build(options);
    }
    if (slug.includes('floor-plan') || slug.includes('floorplan')) {
      return this.floorPlanBuilder.build(options);
    }

    // 3. Editing Builders
    if (
      slug.includes('paint') ||
      slug.includes('light') ||
      slug.includes('cleaner') ||
      slug.includes('flooring')
    ) {
      return this.editingBuilder.build(options);
    }

    // Default to InteriorPromptBuilder for interior-design, ai-room-decorator, bedroom-design, office-design
    return this.interiorBuilder.build(options);
  }
}
