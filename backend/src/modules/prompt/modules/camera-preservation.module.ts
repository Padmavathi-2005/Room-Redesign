import { Injectable } from '@nestjs/common';
import { IPromptModule } from '../interfaces/prompt-module.interface';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';
import { DetailedSectionExplanationItem } from '../interfaces/prompt-output.interface';

@Injectable()
export class CameraPreservationModule implements IPromptModule {
  readonly name = 'Camera Preservation';
  readonly order = 20;

  generate(options: PromptInputOptions): string {
    const userAngle = options.cameraAngle || options.houseAngle || options.perspective;
    const cameraAngleClause = userAngle
      ? `captured from exact specified ${userAngle.toLowerCase()} perspective, maintaining the exact original lighting direction and shadows`
      : 'Maintain the identical camera position, camera perspective, eye-level, field of view, perspective, composition, framing, crop, lens, horizon line, viewing direction, original lighting direction, source light angle, shadow direction, and room proportions exactly as shown in the uploaded image.';
    return cameraAngleClause;
  }

  explain(options: PromptInputOptions): DetailedSectionExplanationItem {
    return {
      sectionName: this.name,
      content: this.generate(options),
      generatedFrom: ['cameraAngle', 'perspective', 'preservationOptions.preserveCamera'],
      purpose: 'Locks camera angle, perspective, eye-level, field of view, and spatial horizon line 100% to match the uploaded photo.',
    };
  }
}
