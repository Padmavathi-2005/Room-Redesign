import { Injectable } from '@nestjs/common';
import { IPromptModule } from '../interfaces/prompt-module.interface';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';
import { DetailedSectionExplanationItem } from '../interfaces/prompt-output.interface';

@Injectable()
export class ImageContextModule implements IPromptModule {
  readonly name = 'Image Context';
  readonly order = 30;

  generate(options: PromptInputOptions): string {
    let visionDetails = '';
    if (options.analysis && options.analysis.fixedElements && options.analysis.fixedElements.length > 0) {
      const fixed = options.analysis.fixedElements.map(f => `${f.name}: ${f.details}`).join('; ');
      visionDetails = ` [EXACT UPLOADED IMAGE VISION SCAN: Preserve ${fixed}]`;
    }

    return `The uploaded image is the primary structural source of truth: analyze the uploaded image and preserve every permanent architectural element, room geometry, room proportions, window count & positions, door positions, ceiling slope, built-in cabinets, structural pillars, and camera framing exactly as shown.${visionDetails}`;
  }

  explain(options: PromptInputOptions): DetailedSectionExplanationItem {
    return {
      sectionName: this.name,
      content: this.generate(options),
      generatedFrom: ['Uploaded Source Image Context'],
      purpose: 'Instructs the image generation AI model to inspect the uploaded image as the authoritative structural source of truth without requiring separate pre-generation API calls.',
    };
  }
}
