import { Injectable } from '@nestjs/common';
import { IPromptModule } from '../interfaces/prompt-module.interface';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';
import { DetailedSectionExplanationItem } from '../interfaces/prompt-output.interface';

@Injectable()
export class ArchitecturePreservationModule implements IPromptModule {
  readonly name = 'Architecture Preservation';
  readonly order = 40;

  generate(options: PromptInputOptions): string {
    const opts = options.preservationOptions || {};
    const preserveWalls = opts.preserveWalls !== false;
    const preserveWindows = opts.preserveWindows !== false;
    const preserveDoors = opts.preserveDoors !== false;
    const preserveCeiling = opts.preserveCeiling !== false;

    const clauses: string[] = [];
    if (preserveWalls) clauses.push('structural walls, vertical corner pillars, wall protrusion columns, alcoves, and room dimensions');
    if (preserveWindows) clauses.push('window size, window positions, and window spacing');
    if (preserveDoors) clauses.push('interior open doorways, hallway archways, and passageways to adjacent rooms (CRITICAL: DO NOT CONVERT INTERIOR DOORWAYS OR ARCHWAYS INTO WINDOWS OR EXTERIOR GLASS WALLS)');
    if (preserveCeiling) clauses.push('ceiling height, ceiling slope, and structural beams');
    clauses.push('built-in cabinets, fireplace, stairs, balcony doors, kitchen counters, and permanent fixtures');

    return `strictly preserve permanent architectural elements: retain ${clauses.join(', ')} without structural alteration. Lock all interior doorways, hallway passages, and open archways exactly in place. Mandatory rules: 1) Preserve exact wall geometry, wall contours, and room dimensions. 2) Preserve exact window placement, window count, and window size. 3) Preserve exact door openings, passageways, and entryways. 4) Preserve original room dimensions, ceiling height, and scale. Do NOT alter any structural walls or openings. Maintain exact 3D wall geometry, vertical corner pillars, and column protrusions`;
  }

  explain(options: PromptInputOptions): DetailedSectionExplanationItem {
    return {
      sectionName: this.name,
      content: this.generate(options),
      generatedFrom: ['preservationOptions', 'preserveStructure'],
      purpose: 'Enforces architectural lock protecting walls, ceiling slope, beams, windows, doors, and permanent fixtures from modification.',
    };
  }
}
