import { Injectable } from '@nestjs/common';
import { DesignStyleEnum } from '../enums/design-style.enum';

@Injectable()
export class MaterialFactory {
  private readonly materialMap: Record<string, string[]> = {
    [DesignStyleEnum.MODERN]: ['Polished Marble', 'Brushed Aluminum', 'Tempered Glass', 'Matte Lacquer', 'Performance Linen'],
    [DesignStyleEnum.LUXURY]: ['Calacatta Marble', 'Polished Brass', 'Imported Italian Leather', 'Silk Velvet', 'Solid Walnut'],
    [DesignStyleEnum.MINIMALIST]: ['Light Matte Ash', 'Smooth Plaster', 'Micro-cement', 'Natural Cotton', 'Concealed Metal Trims'],
    [DesignStyleEnum.SCANDINAVIAN]: ['Natural Light Oak', 'Boiled Wool', 'Brushed Stainless Steel', 'Bleached Linen'],
    [DesignStyleEnum.JAPANDI]: ['Shou Sugi Ban Charred Wood', 'Light Bamboo', 'Woven Tatami Textures', 'Raw Linen'],
    [DesignStyleEnum.INDUSTRIAL]: ['Exposed Red Brick', 'Raw Cast Iron', 'Aged Cognac Leather', 'Polished Concrete'],
    [DesignStyleEnum.TRADITIONAL]: ['Solid Mahogany', 'Burnished Brass', 'Damask Velvet', 'Polished Cherrywood'],
    [DesignStyleEnum.FARMHOUSE]: ['Reclaimed Barnwood', 'Wrought Iron', 'Heavy Cotton Canvas', 'Distressed Pine'],
    [DesignStyleEnum.MEDITERRANEAN]: ['Handcrafted Terracotta', 'Wrought Iron', 'Textured Stucco', 'Olive Wood'],
    [DesignStyleEnum.CONTEMPORARY]: ['Fluted Glass', 'Brushed Bronze', 'Bouclé Fabric', 'Terrazzo Stone'],
    [DesignStyleEnum.BOHEMIAN]: ['Woven Rattan', 'Jute Fiber', 'Terracotta Ceramic', 'Embroidered Cotton'],
    [DesignStyleEnum.COASTAL]: ['Bleached Driftwood', 'Woven Seagrass', 'Weathered Teak', 'Crisp White Cotton'],
    [DesignStyleEnum.MID_CENTURY_MODERN]: ['Warm Walnut', 'Molded Plywood', 'Brass Caps', 'Tweed Fabric'],
    [DesignStyleEnum.ART_DECO]: ['Nero Marquina Marble', 'High-Gloss Polished Brass', 'Crushed Velvet', 'Mirror Glass'],
  };

  getMaterials(styleInput?: string, userMaterialPreference?: string[] | string, budget?: string): string {
    let result = '';

    if (userMaterialPreference) {
      const prefs = Array.isArray(userMaterialPreference) ? userMaterialPreference.join(', ') : userMaterialPreference;
      result = `featuring preferred material textures: ${prefs}`;
    } else {
      const normalized = (styleInput || 'Modern').trim();
      const key = Object.keys(this.materialMap).find((k) => k.toLowerCase() === normalized.toLowerCase());
      const materials = key ? this.materialMap[key] : ['Oak Wood', 'Natural Linen', 'Polished Metal', 'Soft Upholstery'];
      result = materials.join(', ');
    }

    if (budget) {
      result += `, crafted with ${budget.toLowerCase()} tier interior furnishings and premium surface finishes`;
    }

    return result;
  }
}
