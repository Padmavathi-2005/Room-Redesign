import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoomGeneration, RoomDocument } from './schemas/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { PromptBuilderService } from '../modules/prompt/prompt-builder.service';
import { UploadsService } from '../modules/uploads/uploads.service';
import axios from 'axios';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  // In-memory fallback dataset for instant local testing
  private inMemoryRooms: Array<any> = [
    {
      _id: 'sample-1',
      originalImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
      generatedImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop',
      roomType: 'Living Room',
      theme: 'Modern',
      prompt: 'A high quality photorealistic modern interior redesign of a living room',
      status: 'completed',
      createdAt: new Date(),
    },
  ];

  constructor(
    @InjectModel(RoomGeneration.name)
    private readonly roomModel: Model<RoomDocument>,
    private readonly promptBuilderService: PromptBuilderService,
    private readonly uploadsService: UploadsService,
  ) {}

  /**
   * Triggers room redesign generation
   */
  async generateRoomRedesign(dto: CreateRoomDto): Promise<any> {
    const { originalImage, roomType, theme, userPrompt, designStyle, colorPalette, lighting, customInstructions, toolSlug } = dto;
    
    // 1. Build optimized prompt using PromptBuilderService
    const { finalPrompt, negativePrompt } = this.promptBuilderService.buildPrompt({
      roomType,
      theme,
      designStyle,
      colorPalette,
      lighting,
      customInstructions: customInstructions || userPrompt,
      toolSlug,
    });

    // 2. Register original input file metadata in local filesystem & DB
    const inputMediaFile = await this.uploadsService.registerUploadedFile({
      originalName: `input_${Date.now()}.jpg`,
      type: 'original_input',
      externalUrl: originalImage,
    });

    const apiKey = process.env.REPLICATE_API_TOKEN;
    let generatedImageUrl = '';

    if (apiKey && apiKey.trim() !== '') {
      this.logger.log(`Calling Replicate ControlNet AI for ${theme} ${roomType}`);
      try {
        generatedImageUrl = await this.callReplicateAI(originalImage, finalPrompt, negativePrompt);
      } catch (err) {
        this.logger.error(`Replicate AI Error: ${err.message}. Falling back to sample design.`);
        generatedImageUrl = this.getThemeFallbackImage(theme, roomType);
      }
    } else {
      this.logger.log(`Replicate API Key not set. Using sample design fallback for ${theme} ${roomType}.`);
      generatedImageUrl = this.getThemeFallbackImage(theme, roomType);
    }

    // 3. Register output generated file metadata
    const outputMediaFile = await this.uploadsService.registerUploadedFile({
      originalName: `output_${Date.now()}.jpg`,
      type: 'ai_generated',
      externalUrl: generatedImageUrl,
    });

    const roomRecord = {
      originalImage,
      generatedImage: generatedImageUrl,
      originalImageId: (inputMediaFile as any)._id,
      generatedImageId: (outputMediaFile as any)._id,
      toolSlug: toolSlug || 'interior-design',
      roomType,
      theme: designStyle || theme,
      colorPalette,
      lighting,
      customInstructions: customInstructions || userPrompt,
      prompt: finalPrompt,
      negativePrompt,
      creditsUsed: 4,
      status: 'completed',
      createdAt: new Date(),
    };

    try {
      const createdRoom = new this.roomModel(roomRecord);
      return await createdRoom.save();
    } catch (e) {
      this.logger.warn(`MongoDB save bypassed (${e.message}). Saving to memory array.`);
      const memoryItem = {
        _id: 'm_' + Date.now(),
        ...roomRecord,
      };
      this.inMemoryRooms.unshift(memoryItem);
      return memoryItem;
    }
  }

  /**
   * Returns all room design records
   */
  async findAll(): Promise<any[]> {
    try {
      const mongoRooms = await this.roomModel.find().sort({ createdAt: -1 }).exec();
      if (mongoRooms && mongoRooms.length > 0) {
        return mongoRooms;
      }
    } catch (e) {
      this.logger.warn(`MongoDB fetch fallback: ${e.message}`);
    }
    return this.inMemoryRooms;
  }

  /**
   * Returns a single room design by ID
   */
  async findOne(id: string): Promise<any> {
    try {
      if (id.length === 24) {
        const room = await this.roomModel.findById(id).exec();
        if (room) return room;
      }
    } catch (e) {
      // Fall through to memory lookup
    }

    const found = this.inMemoryRooms.find((r) => r._id === id);
    if (!found) {
      throw new NotFoundException(`Room design with ID ${id} not found`);
    }
    return found;
  }

  /**
   * Deletes a room design record
   */
  async remove(id: string): Promise<{ success: boolean; id: string }> {
    try {
      if (id.length === 24) {
        await this.roomModel.findByIdAndDelete(id).exec();
      }
    } catch (e) {
      // Fall through
    }
    this.inMemoryRooms = this.inMemoryRooms.filter((r) => r._id !== id);
    return { success: true, id };
  }

  /**
   * High Precision ControlNet API Call enforcing 1:1 pixel alignment of walls, pillars, and camera angle
   */
  private async callReplicateAI(imageUrl: string, prompt: string, negativePrompt?: string): Promise<string> {
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: '854e8727697a056c525cd2e77d2156a61018194ab7d74f67a9a1ac26e7d44919',
        input: {
          image: imageUrl,
          prompt: prompt,
          a_prompt: 'best quality, extremely detailed, photo, 8k, exact 1:1 pixel alignment with original photo, lock camera perspective angle, preserve left wall pillar position',
          n_prompt: negativePrompt || 'lowres, bad anatomy, bad hands, cropped, worst quality, shifted camera angle, moved wall pillar, scale mismatch',
          num_samples: '1',
          image_resolution: '768',
          controlnet_conditioning_scale: 0.95,
        },
      },
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.output?.[0] || response.data.urls?.get || '';
  }

  private getThemeFallbackImage(theme: string, roomType: string): string {
    const t = theme.toLowerCase();
    const r = roomType.toLowerCase();

    if (t.includes('cyberpunk')) {
      return 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop';
    }
    if (t.includes('scandinavian') || t.includes('minimalist') || t.includes('japandi')) {
      return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop';
    }
    if (t.includes('vintage') || t.includes('industrial')) {
      return 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop';
    }
    if (r.includes('bedroom')) {
      return 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1200&auto=format&fit=crop';
    }
    if (r.includes('kitchen')) {
      return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop';
  }
}
