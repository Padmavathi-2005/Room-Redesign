import { Injectable } from '@nestjs/common';
import { LightingPreferenceEnum } from '../enums/prompt-options.enums';

@Injectable()
export class LightingFactory {
  private readonly lightingMap: Record<string, string> = {
    [LightingPreferenceEnum.BRIGHT_DAYLIGHT]: 'bright natural warm daylight streaming through windows',
    [LightingPreferenceEnum.WARM_AMBIENT]: 'soft warm 2700K ambient illumination with cozy shadows',
    [LightingPreferenceEnum.COOL_WHITE]: 'crisp 5000K cool white daylight with sharp clear clarity',
    [LightingPreferenceEnum.GOLDEN_HOUR]: 'rich warm golden hour sunlight streaming with long soft amber shadows',
    [LightingPreferenceEnum.SOFT_INDIRECT]: 'soft indirect cove LED lighting strips and dimmable accent glow',
    [LightingPreferenceEnum.LUXURY_CHANDELIER]: 'illuminated by a luxury designer chandelier and elegant wall sconces',
    [LightingPreferenceEnum.RECESSED_LIGHTING]: 'highlighted by modern architectural recessed ceiling spotlights',
    [LightingPreferenceEnum.PENDANT_LIGHTS]: 'accented by low-hanging woven pendant lights and warm fixture glow',
  };

  getLightingDescription(lightingInput?: string, timeOfDay?: string): string {
    let result = '';
    if (lightingInput) {
      const normalized = lightingInput.trim();
      const key = Object.keys(this.lightingMap).find((k) => k.toLowerCase() === normalized.toLowerCase());
      result = key ? this.lightingMap[key] : `illuminated with ${lightingInput.toLowerCase()}`;
    } else {
      result = this.lightingMap[LightingPreferenceEnum.BRIGHT_DAYLIGHT];
    }

    if (timeOfDay) {
      result += `, captured during ${timeOfDay.toLowerCase()}`;
    }

    return result;
  }
}
