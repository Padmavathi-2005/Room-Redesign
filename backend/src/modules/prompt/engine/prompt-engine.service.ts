import { Injectable, Inject, Optional } from '@nestjs/common';
import { PROMPT_PIPELINE_MODULES } from './pipeline.tokens';
import { IPromptModule } from '../interfaces/prompt-module.interface';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';
import { PromptOutputResult, DetailedSectionExplanation } from '../interfaces/prompt-output.interface';
import { NegativePromptModule } from '../modules/negative-prompt.module';

// Dynamic Fallback Pipeline for standalone test executions without full NestJS container
import { QualityModule } from '../modules/quality.module';
import { CameraPreservationModule } from '../modules/camera-preservation.module';
import { ImageContextModule } from '../modules/image-context.module';
import { ArchitecturePreservationModule } from '../modules/architecture-preservation.module';
import { EditableElementsModule } from '../modules/editable-elements.module';
import { StyleModule } from '../modules/style.module';
import { ColorPaletteModule } from '../modules/color-palette.module';
import { MaterialsModule } from '../modules/materials.module';
import { FurnitureRulesModule } from '../modules/furniture-rules.module';
import { LightingModule } from '../modules/lighting.module';
import { DecorationsModule } from '../modules/decorations.module';
import { RenderQualityModule } from '../modules/render-quality.module';

import { StyleFactory } from '../factories/style.factory';
import { MaterialFactory } from '../factories/material.factory';
import { LightingFactory } from '../factories/lighting.factory';
import { DecorationFactory } from '../factories/decoration.factory';

@Injectable()
export class PromptEngineService {
  private readonly modules: IPromptModule[];
  private readonly negativePromptModule: NegativePromptModule;

  constructor(
    @Optional()
    @Inject(PROMPT_PIPELINE_MODULES)
    injectedModules?: IPromptModule[],
  ) {
    if (injectedModules && injectedModules.length > 0) {
      this.modules = [...injectedModules].sort((a, b) => a.order - b.order);
      this.negativePromptModule = new NegativePromptModule();
    } else {
      // Standalone Fallback with Factories
      const styleFactory = new StyleFactory();
      const materialFactory = new MaterialFactory();
      const lightingFactory = new LightingFactory();
      const decorationFactory = new DecorationFactory();

      this.modules = [
        new QualityModule(),
        new CameraPreservationModule(),
        new ImageContextModule(),
        new ArchitecturePreservationModule(),
        new EditableElementsModule(),
        new StyleModule(styleFactory),
        new ColorPaletteModule(),
        new MaterialsModule(materialFactory),
        new FurnitureRulesModule(),
        new LightingModule(lightingFactory),
        new DecorationsModule(decorationFactory),
        new RenderQualityModule(),
      ].sort((a, b) => a.order - b.order);

      this.negativePromptModule = new NegativePromptModule();
    }
  }

  /**
   * Main Pipeline Generation Method:
   * Automatically iterates through all dependency-injected pipeline modules in sorted order.
   */
  public generatePrompt(options: PromptInputOptions): PromptOutputResult {
    const positiveChunks: string[] = [];
    const explanation: DetailedSectionExplanation = {};

    // Automatic Pipeline Iteration
    for (const mod of this.modules) {
      const chunk = mod.generate(options);
      if (chunk && chunk.trim().length > 0) {
        positiveChunks.push(chunk.trim());
      }
      explanation[mod.name] = mod.explain(options);
    }

    const positivePrompt = positiveChunks.join(', ');
    const negativePrompt = this.negativePromptModule.generate(options);
    explanation[this.negativePromptModule.name] = this.negativePromptModule.explain(options);

    return {
      finalPrompt: positivePrompt,
      positivePrompt,
      negativePrompt,
      explanation,
    };
  }

  /**
   * Alias for backwards compatibility
   */
  public buildPrompt(options: PromptInputOptions): PromptOutputResult {
    return this.generatePrompt(options);
  }
}
