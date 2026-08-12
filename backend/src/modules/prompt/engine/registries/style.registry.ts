export const STYLE_REGISTRY: Record<string, string> = {
  modern: 'clean geometric lines, sleek furniture silhouettes, polished surfaces, understated elegance, high contrast neutral foundation',
  luxury: 'imported marble finishes, polished metallic accents, double-stitched velvet seating, bespoke custom cabinetry, opulent atmosphere',
  minimalist: 'clutter-free open layout, essential clean-lined furniture, monochromatic warm neutrals, concealed storage elements',
  scandinavian: 'ultra-bright sunlit space, light oak wood finishes, cozy white and neutral linen textiles, functional minimalist aesthetic',
  japandi: 'wabi-sabi organic aesthetic, warm sunlit minimalism, light bamboo and oak wood, paper lantern lighting, serene earthy tones',
  industrial: 'exposed architectural elements, dark steel frame accents, rich cognac leather upholstery, raw concrete textures, high-ceiling loft lighting',
  traditional: 'classic refined wood moldings, rich walnut or mahogany furniture, tailored upholstered seating, ornate classic detailing',
  farmhouse: 'reclaimed wood beams, shiplap wall accents, cozy slipcovered furniture, matte black hardware, warm rustic charm',
  mediterranean: 'warm textured plaster walls, wrought iron accents, terracotta tile tones, arched architectural details, breezy sunlit feel',
  contemporary: 'state-of-the-art designer fixtures, smooth organic curves, contrasting textures, bold artistic accents',
  bohemian: 'vivid woven textiles, rattan and wicker furniture, layered rugs, terracotta pottery, warm vibrant earth tones, lush indoor greenery',
  coastal: 'airy white and soft blue tones, natural rattan decor, light bleached wood, casual linen upholstery, sun-washed coastal atmosphere',
  'mid-century modern': 'iconic tapered wooden legs, organic sculptural forms, warm walnut wood furniture, retro mustard and teal accents',
  'art deco': 'glamorous geometric patterns, brass and gold metallic inlay, rich emerald or sapphire velvet seating, marble floor reflections',
};

export function getStyleDescription(styleName?: string): string {
  if (!styleName) return STYLE_REGISTRY['modern'];
  const key = styleName.toLowerCase().trim();
  return STYLE_REGISTRY[key] || `${styleName} interior aesthetic, harmonious high-end design elements, tailored decor`;
}
