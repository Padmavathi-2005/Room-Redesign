import { PromptEngineInput, IPromptModule, SectionExplanation } from '../types';
import { getStyleDescription } from '../registries/style.registry';
import { getMaterialsForStyle } from '../registries/material.registry';

/**
 * 1. QUALITY MODULE
 */
export class QualityModule implements IPromptModule {
  name: keyof SectionExplanation = 'quality';
  generate(input: PromptEngineInput): string {
    return 'award-winning architectural interior photograph, professional architectural digest showcase, 35mm prime lens shot';
  }
  explain(input: PromptEngineInput): string {
    return 'Establishes high-end architectural photography baseline and lens perspective.';
  }
}

/**
 * 2. CAMERA PRESERVATION MODULE
 */
export class CameraPreservationModule implements IPromptModule {
  name: keyof SectionExplanation = 'cameraPreservation';
  generate(input: PromptEngineInput): string {
    return 'Maintain the identical camera position, eye-level, field of view, perspective, composition, framing, crop, lens, horizon line, viewing direction, and room proportions exactly as shown in the uploaded image.';
  }
  explain(input: PromptEngineInput): string {
    return 'Locks camera angle, perspective, eye-level, and spatial horizon line 100% to match the uploaded photo.';
  }
}

/**
 * 3. ARCHITECTURE PRESERVATION MODULE
 */
export class ArchitecturePreservationModule implements IPromptModule {
  name: keyof SectionExplanation = 'architecturePreservation';
  generate(input: PromptEngineInput): string {
    return 'Analyze the uploaded image and preserve every permanent architectural element exactly as shown: strictly retain room dimensions, structural walls, ceiling height, ceiling slope, structural beams, windows, window size, window position, window spacing, doors, door openings, structural columns, built-in cabinets, fireplace, stairs, balcony doors, kitchen counters, and permanent fixtures without alteration.';
  }
  explain(input: PromptEngineInput): string {
    return 'Instructs the image model to inspect the uploaded image and lock all permanent structural elements (walls, ceiling slope, beams, window counts & positions).';
  }
}

/**
 * 4. EDITABLE ELEMENTS MODULE
 */
export class EditableElementsModule implements IPromptModule {
  name: keyof SectionExplanation = 'editableElements';
  generate(input: PromptEngineInput): string {
    return 'Allow modifications ONLY to non-structural editable elements: movable furniture, wall paint, wallpaper, curtains, rugs, decor, artwork, plants, lighting fixtures, accessories, movable shelves, table decorations, throw pillows, and blankets.';
  }
  explain(input: PromptEngineInput): string {
    return 'Restricts edits strictly to surface finishes and movable decor, protecting structural walls.';
  }
}

/**
 * 5. STYLE MODULE
 */
export class StyleModule implements IPromptModule {
  name: keyof SectionExplanation = 'style';
  generate(input: PromptEngineInput): string {
    const room = input.roomType || 'Living Room';
    const styleName = input.designStyle || 'Modern';
    const styleDesc = getStyleDescription(styleName);
    return `a masterfully redesigned ${styleName.toLowerCase()} ${room.toLowerCase()}, featuring ${styleDesc}`;
  }
  explain(input: PromptEngineInput): string {
    return `Generated dynamic style characteristics based on selected style (${input.designStyle || 'Modern'}) and room type (${input.roomType || 'Living Room'}).`;
  }
}

/**
 * 6. COLOR PALETTE MODULE
 */
export class ColorPaletteModule implements IPromptModule {
  name: keyof SectionExplanation = 'colorPalette';
  generate(input: PromptEngineInput): string {
    const primary = input.primaryColor || 'warm neutral cream';
    const secondary = input.secondaryColor || 'soft natural beige';
    const accent = input.accentColor || 'earthy muted accents';
    return `harmonious color palette anchored by primary ${primary.toLowerCase()}, balanced with secondary ${secondary.toLowerCase()}, and subtle accent touches of ${accent.toLowerCase()}`;
  }
  explain(input: PromptEngineInput): string {
    return `Enforces color harmony using primary (${input.primaryColor || 'cream'}), secondary (${input.secondaryColor || 'beige'}), and accent colors (${input.accentColor || 'earthy tones'}).`;
  }
}

/**
 * 7. MATERIALS MODULE
 */
export class MaterialsModule implements IPromptModule {
  name: keyof SectionExplanation = 'materials';
  generate(input: PromptEngineInput): string {
    return getMaterialsForStyle(input.designStyle, input.budget);
  }
  explain(input: PromptEngineInput): string {
    return `Dynamically maps authentic material textures based on ${input.designStyle || 'chosen style'} and ${input.budget || 'budget level'}.`;
  }
}

/**
 * 8. FURNITURE RULES MODULE
 */
export class FurnitureRulesModule implements IPromptModule {
  name: keyof SectionExplanation = 'furnitureRules';
  generate(input: PromptEngineInput): string {
    const handling = (input.furnitureHandling || 'Replace All Furniture').toLowerCase();

    if (handling.includes('keep') || handling.includes('reuse')) {
      return 'strictly retain existing core furniture placement and key furniture pieces, updating only upholstery fabrics, surface colors, and accent decor';
    }
    if (handling.includes('seating')) {
      return 'replace only seating items with new style-tailored armchairs and sofas while preserving surrounding tables and structural arrangement';
    }
    if (handling.includes('decorations')) {
      return 'preserve main furniture layout and replace only decorative accessories, artwork, rugs, and soft textiles';
    }
    if (handling.includes('furniture and decor') || handling.includes('all')) {
      return 'completely replace all movable furniture items and decor with brand new high-end pieces matching the chosen design style, while keeping exact room layout geometry';
    }
    return 'completely replace movable furniture items with brand new style-matched pieces, respecting original room dimensions';
  }
  explain(input: PromptEngineInput): string {
    return `Applies furniture strategy based on user selection (${input.furnitureHandling || 'Replace All Furniture'}).`;
  }
}

/**
 * 9. LIGHTING MODULE
 */
export class LightingModule implements IPromptModule {
  name: keyof SectionExplanation = 'lighting';
  generate(input: PromptEngineInput): string {
    const lighting = input.lighting ? input.lighting.toLowerCase() : 'bright natural daylight';
    return `illuminated with ${lighting}, creating soft natural shadows, ambient highlights, and clear spatial clarity streaming through windows`;
  }
  explain(input: PromptEngineInput): string {
    return `Configures natural and artificial light sources matching preference (${input.lighting || 'Bright Daylight'}).`;
  }
}

/**
 * 10. DECORATIONS MODULE
 */
export class DecorationsModule implements IPromptModule {
  name: keyof SectionExplanation = 'decorations';
  generate(input: PromptEngineInput): string {
    const custom = input.customInstructions ? `user specifications: ${input.customInstructions}` : '';
    const baseDecor = 'styled with curated art prints, organic indoor potted plants, tailored throw pillows, and cozy woven textiles';
    return custom ? `${baseDecor}, ${custom}` : baseDecor;
  }
  explain(input: PromptEngineInput): string {
    return `Incorporate decor elements and user custom instructions (${input.customInstructions || 'None'}).`;
  }
}

/**
 * 11. RENDER QUALITY MODULE
 */
export class RenderQualityModule implements IPromptModule {
  name: keyof SectionExplanation = 'renderingQuality';
  generate(input: PromptEngineInput): string {
    const creativity = (input.aiCreativity || 'Medium').toLowerCase();
    return `photorealistic 8K UHD architectural interior render, PBR material shaders, ultra detailed textures, realistic light reflections, crisp sharp focus, AI creativity control set to ${creativity}`;
  }
  explain(input: PromptEngineInput): string {
    return `Applies photorealistic 8K render parameters and AI creativity settings (${input.aiCreativity || 'Medium'}).`;
  }
}

/**
 * 12. NEGATIVE PROMPT MODULE
 */
export class NegativePromptModule implements IPromptModule {
  name: keyof SectionExplanation = 'negativePrompt';
  generate(input: PromptEngineInput): string {
    return 'architecture changes, altered wall positions, moved windows, extra windows, missing windows, changed window size, modified ceiling height, altered ceiling slope, added ceiling beams, removed structural beams, modified door openings, camera angle shift, perspective distortion, horizon line shift, altered room proportions, floating furniture, duplicate furniture, blurry textures, low resolution, artifacts, text, watermarks, cartoon look, CGI render, cheap plastic materials, oversaturated colors, harsh noise, distorted geometry';
  }
  explain(input: PromptEngineInput): string {
    return 'Comprehensive negative prompt preventing structural alterations, window relocation, camera shifts, and visual artifacts.';
  }
}
