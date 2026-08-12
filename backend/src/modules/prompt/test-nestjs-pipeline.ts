import { PromptEngineService } from './engine/prompt-engine.service';
import { RoomTypeEnum } from './enums/room-type.enum';
import { DesignStyleEnum } from './enums/design-style.enum';
import {
  BudgetLevelEnum,
  FurnitureHandlingEnum,
  LightingPreferenceEnum,
  AICreativityEnum,
} from './enums/prompt-options.enums';

function testNestJSPipeline() {
  const service = new PromptEngineService();

  console.log('====================================================');
  console.log('1. TESTING GROUPED OPTIONS WITH ENUMS & NEW MODULES');
  console.log('====================================================');

  const result = service.generatePrompt({
    roomOptions: {
      roomType: RoomTypeEnum.KIDS_ROOM,
      roomSize: 'Large (300 - 600 sq ft)',
    },
    styleOptions: {
      designStyle: DesignStyleEnum.TRADITIONAL,
      mood: 'Cozy & Playful',
    },
    colorOptions: {
      primaryColor: 'Sage Green',
      secondaryColor: 'Warm Cream',
      accentColor: 'Terracotta Earth Tones',
    },
    furnitureOptions: {
      furnitureHandling: FurnitureHandlingEnum.REPLACE_SEATING,
    },
    lightingOptions: {
      lighting: LightingPreferenceEnum.COOL_WHITE,
    },
    preservationOptions: {
      preserveWalls: true,
      preserveWindows: true,
      preserveDoors: true,
      preserveCeiling: true,
    },
    aiOptions: {
      aiCreativity: AICreativityEnum.LOW,
      customInstructions: 'Preserve window bench seat, upper shelving beam, and floor lamp position.',
    },
    budgetLevel: BudgetLevelEnum.MEDIUM,
    materialPreference: ['Solid Walnut', 'Burnished Brass', 'Damask Velvet'],
  });

  console.log('\n--- POSITIVE PROMPT ---');
  console.log(result.positivePrompt);

  console.log('\n--- COMPOSABLE NEGATIVE PROMPT ---');
  console.log(result.negativePrompt);

  console.log('\n--- DETAILED SECTION EXPLANATION MODEL ---');
  console.log(JSON.stringify(result.explanation, null, 2));
}

testNestJSPipeline();
