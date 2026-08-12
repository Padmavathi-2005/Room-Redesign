import { IPromptBuilder, PromptOutputResult, COMMON_PHOTOGRAPHIC_BOOSTERS, COMMON_NEGATIVE_PROMPT } from './base-prompt.builder';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';

/**
 * Dedicated Prompt Builder for AI Wall Design Tool
 */
export class WallDesignPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    // 1. Materials Synthesis
    const matList = Array.isArray(options.materials) && options.materials.length > 0
      ? options.materials.join(', ')
      : typeof options.materialPreference === 'string'
      ? options.materialPreference
      : options.theme || 'Light Oak Hardwood & Venetian Plaster';

    // 2. Furniture & Layout Handling
    const furnitureDirective = options.furnitureHandling === 'reuse'
      ? 'preserve existing furniture positions and structural layout'
      : options.furnitureHandling === 'repair'
      ? 'fix and restore damaged furniture surfaces and damaged walls'
      : 'replace existing furniture with modern curated interior pieces';

    // 3. Budget & Finish Level
    const budgetDirective = options.budgetLevel === 'Luxury'
      ? 'ultra-luxury bespoke finishes, high-end Italian craftsmanship'
      : options.budgetLevel === 'Premium'
      ? 'premium designer materials and refined architectural details'
      : options.budgetLevel === 'Low'
      ? 'clean budget-friendly modern aesthetic'
      : 'balanced medium-tier interior finishes';

    // 4. Redesign Scope Directive
    const scopeDirective = options.domainScope === 'exterior'
      ? 'architectural exterior facade renovation, elevation design, outdoor landscaping'
      : options.domainScope === 'floorplan'
      ? 'convert 2D floor plan layout drawing into photorealistic 3D architectural render'
      : 'interior room redesign and spatial transformation';

    // 5. Custom Notes
    const customInstructions = options.customInstructions ? `, custom requirements: ${options.customInstructions}` : '';
    const styleTheme = options.theme ? `, locked theme: ${options.theme}` : '';
    const colorPalette = options.colorPalette ? `, color palette: ${options.colorPalette}` : '';

    const finalPrompt = `${scopeDirective}, room type: ${options.roomType || 'Living Room'}${styleTheme}${colorPalette}, featured materials: ${matList}, layout instruction: ${furnitureDirective}, quality tier: ${budgetDirective}${customInstructions}, ${COMMON_PHOTOGRAPHIC_BOOSTERS}`;

    return {
      finalPrompt,
      negativePrompt: `${COMMON_NEGATIVE_PROMPT}, plain blank wall, damaged plaster, untextured drywall, mismatched furniture`,
    };
  }
}
