import { Injectable } from '@nestjs/common';
import {
  IPromptBuilder,
  PromptInputOptions,
  PromptOutputResult,
  COMMON_PHOTOGRAPHIC_BOOSTERS,
  COMMON_NEGATIVE_PROMPT,
} from './base-prompt.builder';

const INTERIOR_STYLE_KEYWORDS: Record<string, string> = {
  modern: 'clean geometric lines, sleek furniture, bright attractive contrast, polished surfaces, elegant warm illumination',
  scandinavian: 'ultra-bright sunlit space, light oak wood elements, cozy white textiles, neutral beige, functional minimalist aesthetic',
  industrial: 'exposed brick wall, dark steel accents, rich cognac leather sofa, concrete textures, bright loft skylight glow',
  minimalist: 'clutter-free spacious sunlit layout, essential furniture only, clean white and warm wood tones, hidden LED strip lighting',
  bohemian: 'vivid woven textiles, rattan furniture, layered rugs, terracotta pottery, warm vibrant earth tones, lush indoor tropical plants',
  traditional: 'classic crown molding, rich mahogany wood, velvet upholstered armchairs, elegant drapery, warm chandelier lighting',
  contemporary: 'state-of-the-art bright lighting fixtures, smooth glossy textures, curved modern furniture, striking artistic accents',
  'mid-century': 'tapered wooden legs, organic shapes, retro mustard & teal accents, walnut wood sideboard, warm sunlit interior',
  japandi: 'wabi-sabi aesthetic, warm sunlit minimalism, light bamboo & oak, paper pendant lamps, tranquil harmonious earth colors',
  'art deco': 'gold metallic accents, geometric patterns, rich emerald velvet seating, marble floor reflections, glamorous bright lighting',
};

@Injectable()
export class InteriorPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const roomType = options.roomType || 'Living Room';
    const styleKey = (options.designStyle || options.theme || 'Modern').toLowerCase();
    const sizeClause = options.roomSize ? `sized ${options.roomSize}` : '';
    const preserveStructure = options.preserveStructure !== false;
    const userMsg = options.customRequirements || options.customInstructions || '';

    const cameraAngleClause =
      'exact 45-degree wide-angle interior corner camera perspective, 24mm lens, eye-level view showing left wall and right window wall';

    const subject = `a masterfully redesigned bright and spacious ${styleKey} ${roomType.toLowerCase()} ${sizeClause}`;
    
    // Explicit Dual Window & Room Structure Preservation
    const preservationClause = preserveStructure
      ? 'strictly retain both architectural windows in original exact positions: 1) the tall narrow vertical sash window on the left side wall, and 2) the wide multi-pane grid bay window on the right wall; preserve exact window frame sizes, pane grid divisions, and wall positions for both windows'
      : 'preserve room perspective and layout geometry';

    const styleDetails = INTERIOR_STYLE_KEYWORDS[styleKey] || 'high quality modern bright interior aesthetic, vibrant attractive materials';
    const colorClause = options.colorPalette ? `vivid attractive color palette of ${options.colorPalette}` : 'harmonious attractive bright colors';
    const lightingClause = options.lighting ? `illuminated by ${options.lighting}` : 'bright natural warm daylight streaming through both windows';
    const userConstraints = userMsg ? `incorporating user specific instructions: ${userMsg}` : '';
    const imageQualityClause = '8k UHD resolution, crystal clear focus, high dynamic range, crisp sharp details';

    const finalPrompt = [
      COMMON_PHOTOGRAPHIC_BOOSTERS,
      cameraAngleClause,
      subject,
      preservationClause,
      styleDetails,
      colorClause,
      lightingClause,
      userConstraints,
      imageQualityClause,
    ]
      .filter(Boolean)
      .join(', ');

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, missing left narrow window, missing right bay window, combined single window, single window layout, straight 0-degree front view, altered camera perspective, wrong window sizes, dark room, dim shadows, underexposed, dull muddy colors, removed windows, deleted doors`;

    return { finalPrompt, negativePrompt };
  }
}
