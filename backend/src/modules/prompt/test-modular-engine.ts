import { PromptEngineService } from './engine/prompt-engine.service';
import { PromptEngineInput } from './engine/types';

function runTest() {
  const engine = new PromptEngineService();

  const userSelections: PromptEngineInput = {
    roomType: 'Kids Room',
    designStyle: 'Traditional',
    budget: 'Medium',
    primaryColor: 'Sage Green',
    secondaryColor: 'Warm Cream',
    accentColor: 'Terracotta Earth Tones',
    lighting: 'Cool Daylight',
    furnitureHandling: 'Replace Only Seating',
    aiCreativity: 'Low',
    customInstructions: 'Preserve window bench seat, built-in shelf, and floor lamp position.',
  };

  const output = engine.generatePrompt(userSelections);

  console.log('====================================================');
  console.log('1. POSITIVE PROMPT (11 Modular Sections)');
  console.log('====================================================');
  console.log(output.positivePrompt);

  console.log('\n====================================================');
  console.log('2. NEGATIVE PROMPT');
  console.log('====================================================');
  console.log(output.negativePrompt);

  console.log('\n====================================================');
  console.log('3. SECTION EXPLANATIONS (User Input -> Generated Modules)');
  console.log('====================================================');
  console.log(JSON.stringify(output.explanation, null, 2));
}

runTest();
