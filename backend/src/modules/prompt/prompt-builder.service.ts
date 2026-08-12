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
import { LightPromptBuilder } from './builders/light-prompt.builder';
import { CleanerPromptBuilder } from './builders/cleaner-prompt.builder';
import { PaintColorPromptBuilder } from './builders/paint-color-prompt.builder';
import { WallDesignPromptBuilder } from './builders/wall-design-prompt.builder';
import { RoomAnalysisService } from '../room-analysis/room-analysis.service';

@Injectable()
export class PromptBuilderService {
  private readonly roomAnalysisService = new RoomAnalysisService();

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

  // Specialized Interior & Editing Tool Builders
  private readonly lightBuilder = new LightPromptBuilder();
  private readonly cleanerBuilder = new CleanerPromptBuilder();
  private readonly paintColorBuilder = new PaintColorPromptBuilder();
  private readonly wallDesignBuilder = new WallDesignPromptBuilder();
  private readonly editingBuilder = new EditingPromptBuilder();

  /**
   * Master Strategy Factory: Routes request to the dedicated individual tool builder file
   */
  buildPrompt(options: PromptInputOptions): PromptOutputResult {
    // If analysis is missing, generate deterministic default analysis
    if (!options.analysis) {
      options.analysis = this.roomAnalysisService.generateDefaultAnalysis(options);
    }

    const slug = (options.toolSlug || 'interior-design').toLowerCase();

    // 1. Dedicated Specialized Editing Builders
    if (slug === 'change-room-light') {
      return this.lightBuilder.build(options);
    }
    if (slug === 'ai-room-cleaner') {
      return this.cleanerBuilder.build(options);
    }
    if (slug === 'paint-color-visualizer') {
      return this.paintColorBuilder.build(options);
    }
    if (slug === 'ai-wall-design') {
      return this.wallDesignBuilder.build(options);
    }

    // 2. Dedicated Exterior Builders
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

    // 3. Specialized Interior & Floor Plan Builders
    if (slug === 'kitchen-design') {
      return this.kitchenBuilder.build(options);
    }
    if (slug === 'bathroom-design') {
      return this.bathroomBuilder.build(options);
    }
    if (slug.includes('floor-plan') || slug.includes('floorplan')) {
      return this.floorPlanBuilder.build(options);
    }

    // Default to InteriorPromptBuilder for interior-design, ai-room-decorator, bedroom-design, office-design
    const result = this.interiorBuilder.build(options);

    // If structured designTheme is present from project, synthesize into final prompt
    if (options.designTheme && typeof options.designTheme === 'object') {
      const dt = options.designTheme;
      const themeClauses: string[] = [];
      if (dt.style) themeClauses.push(`Project Style: ${dt.style}`);
      if (dt.primaryColors && dt.primaryColors.length > 0) themeClauses.push(`Primary Colors: ${dt.primaryColors.join(', ')}`);
      if (dt.accentColors && dt.accentColors.length > 0) themeClauses.push(`Accent Colors: ${dt.accentColors.join(', ')}`);
      if (dt.materials && dt.materials.length > 0) themeClauses.push(`Materials: ${dt.materials.join(', ')}`);
      if (dt.lighting) themeClauses.push(`Lighting: ${dt.lighting}`);
      if (dt.furnitureStyle) themeClauses.push(`Furniture: ${dt.furnitureStyle}`);
      if (dt.metalFinish) themeClauses.push(`Metal Finish: ${dt.metalFinish}`);

      if (themeClauses.length > 0) {
        result.finalPrompt = `${result.finalPrompt}, Project Design Theme Consistency [${themeClauses.join('; ')}]`;
      }
    }

    return result;
  }

  /**
   * Async builder for when an uploaded image URL is provided to analyze using Vision API
   */
  async buildPromptWithImageAnalysis(options: PromptInputOptions): Promise<PromptOutputResult> {
    if (options.imageUrl) {
      options.analysis = await this.roomAnalysisService.analyzeRoomImage(options.imageUrl, options);
    }
    return this.buildPrompt(options);
  }
}
