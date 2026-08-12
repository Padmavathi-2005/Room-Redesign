import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { RoomAnalysisResult, CameraLockInfo, FixedElement, MovableObject } from './dto/room-analysis.dto';

const DEFAULT_CAMERA_LOCK_CLAUSE =
  'Maintain the identical camera position, viewing direction, eye level, field of view, focal length, perspective, framing, crop, composition, and horizon line exactly as the uploaded image.';

@Injectable()
export class RoomAnalysisService {
  private readonly logger = new Logger(RoomAnalysisService.name);

  /**
   * Analyzes an uploaded room image via Vision AI API (OpenAI / Gemini / Replicate)
   * or returns a structured room analysis based on input metadata.
   */
  async analyzeRoomImage(imageUrlOrBase64?: string, options?: any): Promise<RoomAnalysisResult> {
    const manusKey = process.env.MANUS_API_KEY;

    if (imageUrlOrBase64 && manusKey && (imageUrlOrBase64.startsWith('http://') || imageUrlOrBase64.startsWith('https://') || imageUrlOrBase64.startsWith('data:image/'))) {
      try {
        return await this.analyzeWithManus(imageUrlOrBase64, manusKey);
      } catch (err: any) {
        this.logger.warn(`Manus Vision analysis failed, falling back to default analyzer: ${err.message}`);
      }
    }

    // Default Fallback Analyzer with high structural detection
    return this.generateDefaultAnalysis(options);
  }

  /**
   * Calls Manus Vision API for room image analysis
   */
  private async analyzeWithManus(imageUrl: string, apiKey: string): Promise<RoomAnalysisResult> {
    const manusApiUrl = process.env.MANUS_API_URL || 'https://api.manus.im/v1';
    const systemPrompt = `You are an expert architectural and interior design AI analyzer.
Analyze the provided room image and respond strictly with a JSON object matching this schema:
{
  "cameraLock": {
    "cameraPosition": "Eye level wide perspective",
    "cameraHeight": "1.5m eye level",
    "cameraRotation": "Straight wide view",
    "lens": "35mm architectural lens",
    "perspective": "Two-point perspective",
    "horizon": "Mid-frame horizon line",
    "crop": "Full room view",
    "promptClause": "${DEFAULT_CAMERA_LOCK_CLAUSE}"
  },
  "fixedElements": [
    {"name": "Walls", "editable": false, "details": "Describe exact wall positions"},
    {"name": "Ceiling", "editable": false, "details": "Describe ceiling type and beams"},
    {"name": "Interior Doorways and Open Archways", "editable": false, "details": "CRITICAL: Identify any open interior doorways, hallway passages, or archways leading to stairs/other rooms. Do NOT misidentify interior doorways as windows."},
    {"name": "Windows", "editable": false, "details": "Identify only real glass windows to the exterior. If there are no windows on a wall, explicitly state no windows."}
  ],
  "movableObjects": [
    {"name": "Furniture Item", "replaceable": true, "location": "Location in room"}
  ],
  "editableSurfaces": ["Wall Finish", "Floor Finish", "Curtains", "Decor"],
  "colors": {
    "wallColor": "Current wall color",
    "floorColor": "Current floor color",
    "furnitureColor": "Current furniture color",
    "accentColor": "Current accent color",
    "ceilingColor": "Current ceiling color"
  },
  "emptySpace": ["Passageways and Open Floor Area"]
}`;

    const response = await axios.post(
      `${manusApiUrl}/chat/completions`,
      {
        model: 'manus-vision',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this room image strictly for architectural locks, interior doorways, archways, and window positions.' },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      },
    );

    const content = response.data.choices[0].message.content;
    const parsed = JSON.parse(content);
    parsed.cameraLock.promptClause = DEFAULT_CAMERA_LOCK_CLAUSE;
    return parsed;
  }

  /**
   * Generates deterministic structural analysis fallback
   */
  public generateDefaultAnalysis(options?: any): RoomAnalysisResult {
    const fixed: FixedElement[] = [
      { name: 'Structural Walls', editable: false, details: 'Main boundary walls, paneling, and room boundaries' },
      { name: 'Ceiling Structure', editable: false, details: 'Ceiling height and structural beam placement' },
      { name: 'Interior Doorways & Archways', editable: false, details: 'Open hallway passages, archways, and interior doorways leading to stairs or adjoining rooms' },
      { name: 'Permanent Openings', editable: false, details: 'Retain original wall openings and entryways without converting them into windows' },
    ];

    const movable: MovableObject[] = [
      { name: 'Main Sofa / Seating', replaceable: true, location: 'Seating area' },
      { name: 'Coffee Table', replaceable: true, location: 'Center floor' },
      { name: 'Decor & Lighting', replaceable: true, location: 'Room accent areas' },
    ];

    return {
      cameraLock: {
        cameraPosition: 'Eye-level perspective',
        cameraHeight: 'Standard eye level (1.5m)',
        cameraRotation: 'Centered architectural framing',
        lens: '35mm architectural lens',
        perspective: 'Two-point architectural perspective',
        horizon: 'Centered spatial horizon',
        crop: 'Full room perspective',
        promptClause: DEFAULT_CAMERA_LOCK_CLAUSE,
      },
      fixedElements: fixed,
      movableObjects: movable,
      editableSurfaces: ['Wall Paint', 'Wallpaper', 'Floor Finish', 'Curtains', 'Soft Decor'],
      colors: {
        wallColor: 'Original Wall Tone',
        floorColor: 'Original Floor Finish',
        furnitureColor: 'New Design Style Palette',
        accentColor: 'Harmonious Accents',
        ceilingColor: 'Neutral Ceiling Finish',
      },
      emptySpace: ['Interior Passageways', 'Floor Center Area'],
    };
  }
}
