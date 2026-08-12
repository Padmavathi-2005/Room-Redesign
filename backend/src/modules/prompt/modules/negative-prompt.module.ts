import { Injectable } from '@nestjs/common';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';
import { DetailedSectionExplanationItem } from '../interfaces/prompt-output.interface';

@Injectable()
export class NegativePromptModule {
  readonly name = 'Negative Prompt';

  private readonly geometryNegative =
    'perspective distortion, camera angle shift, horizon line shift, altered room proportions, warped perspective';

  private readonly architectureNegative =
    'architecture changes, altered wall positions, moved windows, extra windows, missing windows, changed window size, window relocation, converting interior doorways to windows, replacing open archway with window, replacing interior passageway with glass wall, removing wall corner pillar, flattening vertical wall column, removing wall protrusion, closing open hallway doorway, converting open archway to solid wall, modified ceiling height, altered ceiling slope, added ceiling beams, removed structural beams, modified door openings, added fireplace';

  private readonly cameraNegative =
    'shifted camera perspective, altered eye level, distorted horizon line, changed camera height, modified focal length';

  private readonly lightingNegative =
    'underexposed, dark room, dim shadows, dull desaturated colors, harsh glare, overexposed highlights';

  private readonly qualityNegative =
    'blurry textures, low resolution, artifacts, text, watermarks, cartoon look, 3D CGI render, cheap plastic materials, oversaturated colors, noise, distorted geometry, floating furniture, duplicate furniture';

  generate(options: PromptInputOptions): string {
    const composables = [
      this.geometryNegative,
      this.architectureNegative,
      this.cameraNegative,
      this.lightingNegative,
      this.qualityNegative,
    ];

    return composables.join(', ');
  }

  explain(options: PromptInputOptions): DetailedSectionExplanationItem {
    return {
      sectionName: this.name,
      content: this.generate(options),
      generatedFrom: ['Composable Negative Modules (Geometry, Architecture, Camera, Lighting, Quality)'],
      purpose: 'Dynamically combines reusable negative prompt sections to prevent structural alterations, window relocation, camera shifts, and visual artifacts.',
    };
  }
}
