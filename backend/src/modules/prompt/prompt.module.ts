import { Module, Provider } from '@nestjs/common';
import { PromptEngineService } from './engine/prompt-engine.service';
import { PromptBuilderService } from './prompt-builder.service';

// Factories
import { StyleFactory } from './factories/style.factory';
import { MaterialFactory } from './factories/material.factory';
import { LightingFactory } from './factories/lighting.factory';
import { DecorationFactory } from './factories/decoration.factory';

// Modules
import { QualityModule } from './modules/quality.module';
import { CameraPreservationModule } from './modules/camera-preservation.module';
import { ImageContextModule } from './modules/image-context.module';
import { ArchitecturePreservationModule } from './modules/architecture-preservation.module';
import { EditableElementsModule } from './modules/editable-elements.module';
import { StyleModule } from './modules/style.module';
import { ColorPaletteModule } from './modules/color-palette.module';
import { MaterialsModule } from './modules/materials.module';
import { FurnitureRulesModule } from './modules/furniture-rules.module';
import { LightingModule } from './modules/lighting.module';
import { DecorationsModule } from './modules/decorations.module';
import { RenderQualityModule } from './modules/render-quality.module';
import { NegativePromptModule } from './modules/negative-prompt.module';

// Builders
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

// Pipeline Token
import { PROMPT_PIPELINE_MODULES } from './engine/pipeline.tokens';

const PIPELINE_MODULE_PROVIDERS: Provider[] = [
  {
    provide: PROMPT_PIPELINE_MODULES,
    useFactory: (
      quality: QualityModule,
      camera: CameraPreservationModule,
      imageContext: ImageContextModule,
      arch: ArchitecturePreservationModule,
      editable: EditableElementsModule,
      style: StyleModule,
      color: ColorPaletteModule,
      materials: MaterialsModule,
      furniture: FurnitureRulesModule,
      lighting: LightingModule,
      decorations: DecorationsModule,
      render: RenderQualityModule,
    ) => [
      quality,
      camera,
      imageContext,
      arch,
      editable,
      style,
      color,
      materials,
      furniture,
      lighting,
      decorations,
      render,
    ],
    inject: [
      QualityModule,
      CameraPreservationModule,
      ImageContextModule,
      ArchitecturePreservationModule,
      EditableElementsModule,
      StyleModule,
      ColorPaletteModule,
      MaterialsModule,
      FurnitureRulesModule,
      LightingModule,
      DecorationsModule,
      RenderQualityModule,
    ],
  },
];

@Module({
  providers: [
    // Factories
    StyleFactory,
    MaterialFactory,
    LightingFactory,
    DecorationFactory,

    // Pipeline Modules
    QualityModule,
    CameraPreservationModule,
    ImageContextModule,
    ArchitecturePreservationModule,
    EditableElementsModule,
    StyleModule,
    ColorPaletteModule,
    MaterialsModule,
    FurnitureRulesModule,
    LightingModule,
    DecorationsModule,
    RenderQualityModule,
    NegativePromptModule,

    // Pipeline DI Provider
    ...PIPELINE_MODULE_PROVIDERS,

    // Core Engine Service
    PromptEngineService,
    PromptBuilderService,

    // Individual Builders
    InteriorPromptBuilder,
    KitchenPromptBuilder,
    BathroomPromptBuilder,
    FloorPlanPromptBuilder,
    ExteriorDesignPromptBuilder,
    LandscapePromptBuilder,
    GardenPromptBuilder,
    ChangeSkyPromptBuilder,
    SketchToRenderPromptBuilder,
    AiArchitecturePromptBuilder,
    AiBlueprintPromptBuilder,
    EditingPromptBuilder,
  ],
  exports: [
    PromptEngineService,
    PromptBuilderService,
    InteriorPromptBuilder,
    StyleFactory,
    MaterialFactory,
  ],
})
export class PromptModule {}
