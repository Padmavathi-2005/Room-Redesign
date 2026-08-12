import { Injectable } from '@nestjs/common';
import {
  IPromptBuilder,
  PromptInputOptions,
  PromptOutputResult,
  COMMON_PHOTOGRAPHIC_BOOSTERS,
  COMMON_NEGATIVE_PROMPT,
} from './base-prompt.builder';

const EXTERIOR_STYLE_KEYWORDS: Record<string, string> = {
  modern: 'clean cantilevered geometric forms, sleek composite panels, floor-to-ceiling glass windows, warm LED cove lighting',
  contemporary: 'curved architectural accents, state-of-the-art rainscreen facade, dark bronze window trims, polished concrete entry',
  minimalist: 'monolithic white stucco, concealed rain gutters, floor-to-ceiling window panes, seamless timber slat accents',
  luxury: 'imported Italian limestone, floor-to-ceiling double-height glass entryway, brass accents, ambient landscape water feature',
  traditional: 'symmetrical brick masonry, classic gabled roofline, crown trim details, divided light window panes',
  colonial: 'white lap siding, prominent portico with stately columns, black exterior window shutters, dormer windows',
  mediterranean: 'terracotta Spanish clay roof tiles, hand-textured warm stucco walls, wrought iron balconies, arched window openings',
  japanese: 'shou sugi ban charred dark wood cladding, cedar timber posts, minimal dark metal trim, zen garden entry path',
  scandinavian: 'natural vertical pine timber cladding, steep A-frame gables, large black-framed glass windows, sunlit porch',
  industrial: 'exposed red brick, black steel I-beams, corrugated charcoal metal panels, wide factory grid windows',
  rustic: 'stacked natural fieldstone wall, heavy timber-frame posts, cedar shingle roof, warm lantern sconces',
  victorian: 'ornate gingerbread trim, decorative gable brackets, octagonal turret tower, multi-hued historic facade colors',
  tropical: 'overhanging bamboo & teak eaves, louvered wooden shutters, natural lava stone accents, lush palm canopy backdrop',
  'eco-friendly': 'integrated green living plant facade, rooftop solar glass tiles, recycled timber cladding, rainwater collection features',
};

const ROOF_TYPE_KEYWORDS: Record<string, string> = {
  'flat roof': 'sleek modern flat roofline with clean parapet edging and concealed drainage',
  'sloped roof': 'contemporary single-slope mono-pitch shed roof with standing seam metal panels',
  'gable roof': 'classic steep-pitched triangular gable roof with slate tiles and decorative bargeboards',
  'hip roof': 'four-sided sloped hip roof architecture with clay roof tiles and ridge capping',
  'terrace roof': 'usable open rooftop terrace with glass perimeter safety railings, outdoor lounge seating, and ambient lighting',
};

const LIGHTING_KEYWORDS: Record<string, string> = {
  warm: 'illuminated by soft warm golden hour ambient lighting with 2700K temperature glow',
  cool: 'illuminated by crisp daylight 5000K cool bright architectural lighting with clear contrast',
  'luxury lighting': 'featuring luxury bespoke architectural lighting, dramatic uplighting, dimmable recessed spotlights, and brass sconces',
  'landscape lighting': 'accentuated by warm outdoor landscape lighting, garden bollard lights, tree uplights, and pathway step lights',
  'hidden led': 'highlighted by architectural hidden LED cove lighting strips along wall perimeters, soffits, and floating cabinetry',
  'wall lights': 'flanked by elegant modern exterior wall sconces, vertical beam lights, and architectural fixture glow',
};

const ENVIRONMENT_KEYWORDS: Record<string, string> = {
  city: 'set in a vibrant modern urban cityscape environment with surrounding glass high-rises and paved streetscape',
  village: 'set in a charming quaint rural village environment with cobblestone paths and rolling green hills',
  beach: 'situated in a coastal tropical beach environment with ocean views, white palm sands, and sea breeze',
  forest: 'surrounded by a dense alpine pine forest environment with tall timber trees and natural woodland backdrop',
  mountain: 'perched in a dramatic mountain landscape environment with rocky peaks, clear sky, and alpine backdrop',
  snow: 'set in a pristine winter wonderland environment with fresh white snow covering ground and pine trees',
  'lake side': 'situated on a tranquil lakeside waterfront environment with serene lake reflections and dock view',
  desert: 'located in a warm desert landscape environment with sand dunes, terracotta rocks, and arid flora',
  countryside: 'nestled in a wide open countryside environment with green meadows, wooden fences, and natural horizon',
};

const TIME_OF_DAY_KEYWORDS: Record<string, string> = {
  morning: 'captured during crisp early morning sunlight with clear soft ambient shadows',
  afternoon: 'captured during bright clear midday afternoon sun with high visibility and sharp detail',
  'golden hour': 'bathed in warm rich golden hour sunlight streaming with long soft amber shadows',
  sunset: 'captured during dramatic twilight sunset with vibrant crimson and orange sky gradients',
  night: 'captured at night with dark night sky, illuminated by exterior architectural fixture lighting and warm window glow',
  rainy: 'captured during atmospheric overcast rainy weather with wet pavement reflections and soft mist',
  snow: 'captured during peaceful snowfall with fresh white snow covering surfaces and soft winter daylight',
};

@Injectable()
export class ExteriorDesignPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const styleKey = (options.designStyle || options.theme || 'Modern').toLowerCase();
    const buildingType = options.buildingType || 'House';
    const roofType = options.roofType || '';
    const lighting = options.lighting || '';
    const environment = options.environment || '';
    const timeOfDay = options.timeOfDay || '';
    const colorPalette = options.colorPalette || '';
    const tool = options.tool || 'Redesign';
    const aiIntervention = options.aiIntervention || 'Medium';
    const userMsg = options.customInstructions || options.customRequirements || '';

    // Camera Angle / View Alignment
    const rawAngle = options.houseAngle || options.cameraAngle || options.perspective;
    const angleClause = rawAngle
      ? `camera angle positioned at exact ${rawAngle.toLowerCase()}`
      : 'matching exact camera view angle, focal length, eye level, and perspective of uploaded photo';

    const styleDetails = EXTERIOR_STYLE_KEYWORDS[styleKey] || 'high quality modern architectural facade materials, bright attractive finishes';
    const roofClause = ROOF_TYPE_KEYWORDS[roofType.toLowerCase()] || (roofType ? `featuring a ${roofType.toLowerCase()}` : '');
    const lightingClause = LIGHTING_KEYWORDS[lighting.toLowerCase()] || (lighting ? `illuminated by ${lighting.toLowerCase()}` : 'bright natural warm daylight');
    const envClause = ENVIRONMENT_KEYWORDS[environment.toLowerCase()] || (environment ? `set in a ${environment.toLowerCase()} environment` : '');
    const todClause = TIME_OF_DAY_KEYWORDS[timeOfDay.toLowerCase()] || (timeOfDay ? `during ${timeOfDay.toLowerCase()}` : '');
    const colorClause = colorPalette ? `accentuated with ${colorPalette.toLowerCase()} exterior color palette` : '';

    const toolClause = tool === 'Sky & Weather Swap' 
      ? 'dramatic golden hour sunset sky with soft warm ambient outdoor weather swap lighting'
      : tool === 'Sketch to Render'
      ? 'hyper-realistic architectural 3D render transformed from line drawing sketch'
      : tool === 'Video Walkthrough'
      ? 'cinematic drone sweep architectural camera walkthrough perspective'
      : `complete exterior architectural ${styleKey} ${buildingType.toLowerCase()} redesign`;

    const interventionClause = `AI intervention strength set to ${aiIntervention.toLowerCase()}`;
    const imageAnalysis =
      'analyzing facade structural lines, roofline geometry, main entrance placement, and window aperture grid';
    const preservationRule =
      'preserve original building silhouette, retains structural wall boundaries, door framing, and window grid geometry; update exterior facade materials, wood slat cladding, and architectural lighting only';

    const subject = `a high-end 8k architectural exterior photograph of a ${styleKey} ${buildingType.toLowerCase()} facade, ${angleClause}`;
    const userConstraints = userMsg ? `incorporating custom exterior instructions: ${userMsg}` : '';

    const finalPrompt = [
      COMMON_PHOTOGRAPHIC_BOOSTERS,
      imageAnalysis,
      subject,
      styleDetails,
      roofClause,
      colorClause,
      lightingClause,
      envClause,
      todClause,
      toolClause,
      interventionClause,
      preservationRule,
      userConstraints,
    ]
      .filter(Boolean)
      .join(', ');

    const negativePrompt = `${COMMON_NEGATIVE_PROMPT}, collapsed building, warped windows, floating roof, distorted facade geometry, altered entrance placement`;

    return { finalPrompt, negativePrompt };
  }
}
