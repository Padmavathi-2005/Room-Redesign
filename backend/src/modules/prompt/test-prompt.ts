import { PromptBuilderService } from './prompt-builder.service';

const service = new PromptBuilderService();

const resultJapandi = service.buildPrompt({
  toolSlug: 'interior-design',
  roomType: 'Living Room',
  designStyle: 'Japandi',
  roomSize: 'Large (300 - 600 sq ft)',
  customRequirements:
    'Keep the large grid windows on right, replace dark walls with warm cream plaster, add light oak coffee table and minimalist beige linen sofa.',
  preserveStructure: true,
});

console.log('--- TEST RUN 1: Japandi Style ---');
console.log('POSITIVE PROMPT:\n', resultJapandi.finalPrompt);
console.log('\nNEGATIVE PROMPT:\n', resultJapandi.negativePrompt);

const resultModern = service.buildPrompt({
  toolSlug: 'interior-design',
  roomType: 'Living Room',
  designStyle: 'Modern',
  roomSize: 'Large (300 - 600 sq ft)',
  customRequirements:
    'Bright sunlit space, polished white marble coffee table, dark gray velvet sectional sofa, brass accent lamps.',
  preserveStructure: true,
});

console.log('\n--- TEST RUN 2: Modern Luxury Style ---');
console.log('POSITIVE PROMPT:\n', resultModern.finalPrompt);
console.log('\nNEGATIVE PROMPT:\n', resultModern.negativePrompt);
