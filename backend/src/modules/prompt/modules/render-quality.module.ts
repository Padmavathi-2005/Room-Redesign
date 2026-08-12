import { Injectable } from '@nestjs/common';
import { IPromptModule } from '../interfaces/prompt-module.interface';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';
import { DetailedSectionExplanationItem } from '../interfaces/prompt-output.interface';

@Injectable()
export class RenderQualityModule implements IPromptModule {
  readonly name = 'Rendering Quality';
  readonly order = 120;

  generate(options: PromptInputOptions): string {
    const quality = options.renderingOptions?.renderQuality || 'Photorealistic 8K UHD';
    const creativity = options.aiOptions?.aiCreativity || options.aiIntervention || 'Medium';

    return `${quality}, PBR material shaders, ultra detailed textures, realistic light reflections, crisp sharp focus, magazine-quality interior photography, AI creativity control set to ${String(creativity).toLowerCase()}`;
  }

  explain(options: PromptInputOptions): DetailedSectionExplanationItem {
    const quality = options.renderingOptions?.renderQuality || 'Photorealistic 8K UHD';
    const creativity = options.aiOptions?.aiCreativity || options.aiIntervention || 'Medium';
    return {
      sectionName: this.name,
      content: this.generate(options),
      generatedFrom: ['renderQuality', 'aiCreativity', 'aiIntervention'],
      purpose: `Applies 8K render parameters, PBR shader reflections, and AI creativity level (${creativity}).`,
    };
  }
}
