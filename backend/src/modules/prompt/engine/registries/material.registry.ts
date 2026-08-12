export const MATERIAL_REGISTRY: Record<string, string[]> = {
  modern: ['Polished Marble', 'Brushed Aluminum', 'Tempered Glass', 'Matte Lacquer', 'Performance Linen'],
  luxury: ['Calacatta Marble', 'Polished Brass', 'Imported Italian Leather', 'Silk Velvet', 'Solid Walnut'],
  minimalist: ['Light Matte Ash', 'Smooth Plaster', 'Micro-cement', 'Natural Cotton', 'Concealed Metal Trims'],
  scandinavian: ['Natural Light Oak', 'Boiled Wool', 'Brushed Stainless Steel', 'Bleached Linen', 'Matte White Ceramic'],
  japandi: ['Shou Sugi Ban Charred Wood', 'Light Bamboo', 'Woven Tatami Textures', 'Raw Linen', 'Unglazed Clay'],
  industrial: ['Exposed Red Brick', 'Raw Cast Iron', 'Aged Cognac Leather', 'Polished Concrete', 'Charcoal Steel'],
  traditional: ['Solid Mahogany', 'Burnished Brass', 'Damask Velvet', 'Polished Cherrywood', 'Classic Carved Timber'],
  farmhouse: ['Reclaimed Barnwood', 'Wrought Iron', 'Heavy Cotton Canvas', 'Distressed Pine', 'Galvanized Metal'],
  mediterranean: ['Handcrafted Terracotta', 'Wrought Iron', 'Textured Stucco', 'Olive Wood', 'Tumbled Limestone'],
  contemporary: ['Fluted Glass', 'Brushed Bronze', 'Bouclé Fabric', 'Terrazzo Stone', 'Satin Enamel'],
  bohemian: ['Woven Rattan', 'Jute Fiber', 'Terracotta Ceramic', 'Embroidered Cotton', 'Reclaimed Teak Wood'],
  coastal: ['Bleached Driftwood', 'Woven Seagrass', 'Weathered Teak', 'Crisp White Cotton', 'Polished Shell Accents'],
  'mid-century modern': ['Warm Walnut', 'Molded Plywood', 'Brass Caps', 'Tweed Fabric', 'Polished Teak'],
  'art deco': ['Nero Marquina Marble', 'High-Gloss Polished Brass', 'Crushed Velvet', 'Mirror Glass', 'Burl Wood'],
};

export function getMaterialsForStyle(styleName?: string, budget?: string): string {
  const key = (styleName || 'modern').toLowerCase().trim();
  const materials = MATERIAL_REGISTRY[key] || MATERIAL_REGISTRY['modern'];
  
  let result = materials.join(', ');
  if (budget) {
    result += `, crafted with ${budget.toLowerCase()} level craftsmanship and refined material finishes`;
  }
  return result;
}
