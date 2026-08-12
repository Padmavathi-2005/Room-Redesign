import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoofType, RoofTypeDocument } from './schemas/roof-type.schema';

@Injectable()
export class RoofTypesService {
  private readonly logger = new Logger(RoofTypesService.name);

  private readonly seedRoofTypes = [
    {
      slug: 'flat-roof',
      name: 'Flat Roof',
      description: 'Sleek modern flat roofline with clean parapet edges and concealed drainage.',
      architecturalPromptBooster: 'modern flat roofline with clean parapet edging and concealed gutters',
    },
    {
      slug: 'sloped-roof',
      name: 'Sloped Roof',
      description: 'Modern single-slope shed roof structure with standing seam metal roofing.',
      architecturalPromptBooster: 'contemporary single-slope mono-pitch shed roof with standing seam metal panels',
    },
    {
      slug: 'gable-roof',
      name: 'Gable Roof',
      description: 'Classic triangular pitched gable roof with clean bargeboards and slate tiles.',
      architecturalPromptBooster: 'classic steep-pitched triangular gable roof with slate tiles and decorative bargeboards',
    },
    {
      slug: 'hip-roof',
      name: 'Hip Roof',
      description: 'Sloped hip roof design with four sloping sides converging at a clean ridge.',
      architecturalPromptBooster: 'four-sided sloped hip roof architecture with clay roof tiles and ridge capping',
    },
    {
      slug: 'terrace-roof',
      name: 'Terrace Roof',
      description: 'Accessible flat rooftop terrace featuring glass perimeter safety railings, outdoor lounge decking, and ambient night lighting.',
      architecturalPromptBooster: 'usable open rooftop terrace with glass perimeter railings, outdoor lounge seating, and ambient lighting',
    },
  ];

  constructor(
    @InjectModel(RoofType.name)
    private readonly roofTypeModel: Model<RoofTypeDocument>,
  ) {}

  async findAll(): Promise<RoofType[]> {
    try {
      const roofTypes = await this.roofTypeModel.find().exec();
      if (roofTypes && roofTypes.length > 0) {
        return roofTypes;
      }
    } catch (err) {
      this.logger.warn(`MongoDB RoofTypes fallback: ${err.message}`);
    }
    return this.seedRoofTypes as any;
  }

  async findBySlug(slug: string): Promise<RoofType | undefined> {
    try {
      const roofType = await this.roofTypeModel.findOne({ slug }).exec();
      if (roofType) return roofType;
    } catch (err) {
      // Fallback to seed lookup
    }
    return this.seedRoofTypes.find((r) => r.slug === slug || r.name.toLowerCase() === slug.toLowerCase()) as any;
  }
}
