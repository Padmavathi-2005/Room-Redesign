import { Injectable } from '@nestjs/common';
import {
  IPromptBuilder,
  PromptInputOptions,
  PromptOutputResult,
  COMMON_PHOTOGRAPHIC_BOOSTERS,
  COMMON_NEGATIVE_PROMPT,
} from './base-prompt.builder';

@Injectable()
export class LandscapePromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const style = options.designStyle || options.theme || 'Modern Landscape';
    const roomType = options.roomType || 'Garden Landscape';
    const lighting = options.lighting || '';
    const environment = options.environment || '';
    const timeOfDay = options.timeOfDay || '';
    const userMsg = options.customRequirements || options.customInstructions || '';

    // Camera Angle / View Alignment
    const rawAngle = options.houseAngle || options.cameraAngle || options.perspective;
    const angleClause = rawAngle
      ? `captured from exact specified ${rawAngle.toLowerCase()} perspective`
      : 'matching exact camera view angle, horizon line, and spatial perspective of uploaded photo';

    const imageAnalysis =
      'analyzing ground slope topography, property boundary lines, patio perimeter, and outdoor pathway trajectories';
    const preservationRule =
      'retain main building boundary and property fences; redesign lawn grass, stone stepping pathways, pergolas, and landscape lighting';

    const subject = `a luxury ${style.toLowerCase()} ${roomType.toLowerCase()} design, ${angleClause}`;
    const lightingClause = lighting ? `illuminated by ${lighting.toLowerCase()}` : 'accentuated by warm outdoor landscape lighting';
    const envClause = environment ? `set in a ${environment.toLowerCase()} environment` : '';
    const todClause = timeOfDay ? `during ${timeOfDay.toLowerCase()}` : '';
    const userConstraints = userMsg ? `user specifications: ${userMsg}` : '';

    const finalPrompt = [
      COMMON_PHOTOGRAPHIC_BOOSTERS,
      imageAnalysis,
      subject,
      lightingClause,
      envClause,
      todClause,
      preservationRule,
      userConstraints,
    ]
      .filter(Boolean)
      .join(', ');

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, altered camera perspective, dead grass, messy weeds, distorted stone paving, floating pergola, ruined building facade`;

    return { finalPrompt, negativePrompt };
  }
}
