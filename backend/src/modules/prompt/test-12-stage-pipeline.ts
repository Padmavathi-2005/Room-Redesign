import { PromptBuilderService } from './prompt-builder.service';
import { RoomAnalysisService } from '../room-analysis/room-analysis.service';

async function testPipeline() {
  const analysisService = new RoomAnalysisService();
  const promptService = new PromptBuilderService();

  const analysis = analysisService.generateDefaultAnalysis();

  console.log('====================================================');
  console.log('1. ROOM ANALYSIS JSON (Vision AI Output)');
  console.log('====================================================');
  console.log(JSON.stringify(analysis, null, 2));

  const result = promptService.buildPrompt({
    toolSlug: 'interior-design',
    roomType: 'Kids Room',
    designStyle: 'Traditional',
    colorPalette: 'earth tone',
    lighting: 'cool',
    furnitureHandling: 'replace-damaged',
    budgetLevel: 'medium',
    aiIntervention: 'low',
    analysis: analysis,
  });

  console.log('\n====================================================');
  console.log('2. 12-STAGE POSITIVE PROMPT');
  console.log('====================================================');
  console.log(result.finalPrompt);

  console.log('\n====================================================');
  console.log('3. NEGATIVE PROMPT (Architecture Protection)');
  console.log('====================================================');
  console.log(result.negativePrompt);
}

testPipeline();
