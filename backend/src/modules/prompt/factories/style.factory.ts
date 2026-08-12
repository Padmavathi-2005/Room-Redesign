import { Injectable } from '@nestjs/common';
import { DesignStyleEnum } from '../enums/design-style.enum';

@Injectable()
export class StyleFactory {
  private readonly styleMap: Record<string, string> = {
    [DesignStyleEnum.MODERN]: 'clean geometric lines, sleek furniture silhouettes, polished surfaces, elegant warm illumination',
    [DesignStyleEnum.LUXURY]: 'imported marble finishes, polished metallic accents, double-stitched velvet seating, bespoke custom cabinetry',
    [DesignStyleEnum.MINIMALIST]: 'clutter-free open layout, essential clean-lined furniture, monochromatic warm neutrals, concealed storage elements',
    [DesignStyleEnum.SCANDINAVIAN]: 'ultra-bright sunlit space, light oak wood elements, cozy white textiles, neutral beige, functional minimalist aesthetic',
    [DesignStyleEnum.JAPANDI]: 'wabi-sabi organic aesthetic, warm sunlit minimalism, light bamboo & oak, paper pendant lamps, tranquil harmonious earth colors',
    [DesignStyleEnum.INDUSTRIAL]: 'exposed architectural elements, dark steel frame accents, rich cognac leather upholstery, raw concrete textures',
    [DesignStyleEnum.TRADITIONAL]: 'classic refined wood moldings, rich walnut or mahogany furniture, tailored upholstered seating, ornate classic detailing',
    [DesignStyleEnum.FARMHOUSE]: 'reclaimed wood beams, shiplap wall accents, cozy slipcovered furniture, matte black hardware, warm rustic charm',
    [DesignStyleEnum.MEDITERRANEAN]: 'warm textured plaster walls, wrought iron accents, terracotta tile tones, arched architectural details',
    [DesignStyleEnum.CONTEMPORARY]: 'state-of-the-art designer fixtures, smooth organic curves, contrasting textures, bold artistic accents',
    [DesignStyleEnum.BOHEMIAN]: 'vivid woven textiles, rattan and wicker furniture, layered rugs, terracotta pottery, warm vibrant earth tones',
    [DesignStyleEnum.COASTAL]: 'airy white and soft blue tones, natural rattan decor, light bleached wood, casual linen upholstery',
    [DesignStyleEnum.MID_CENTURY_MODERN]: 'iconic tapered wooden legs, organic sculptural forms, warm walnut wood furniture, retro mustard and teal accents',
    [DesignStyleEnum.ART_DECO]: 'glamorous geometric patterns, brass and gold metallic inlay, rich emerald velvet seating, marble floor reflections',
    [DesignStyleEnum.RUSTIC]: 'stacked natural stone, heavy timber beams, cedar shingles, warm lantern glow',
  };

  getStyleDescription(styleInput?: string): string {
    if (!styleInput) return this.styleMap[DesignStyleEnum.MODERN];
    const normalized = styleInput.trim();
    const key = Object.keys(this.styleMap).find(
      (k) => k.toLowerCase() === normalized.toLowerCase(),
    );
    return key
      ? this.styleMap[key]
      : `${styleInput} interior aesthetic, harmonious high-end design elements, tailored decor`;
  }
}
