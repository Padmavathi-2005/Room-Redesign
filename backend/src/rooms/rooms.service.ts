import { Injectable, Logger, NotFoundException, GatewayTimeoutException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoomGeneration, RoomDocument } from './schemas/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { UploadsService } from '../modules/uploads/uploads.service';
import { ProviderManagerService } from '../modules/provider-manager/provider-manager.service';

import { ProjectsService } from '../modules/projects/projects.service';
import { User, UserDocument } from '../modules/users/schemas/user.schema';

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
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly uploadsService: UploadsService,
    private readonly providerManagerService: ProviderManagerService,
    private readonly projectsService: ProjectsService,
  ) {}

  /**
   * Triggers room redesign generation by enqueuing a background job
   * and synchronously waiting for the background QueueWorker to finish processing it.
   */
  async generateRoomRedesign(dto: CreateRoomDto): Promise<any> {
    const { 
      originalImage, roomType, theme, userPrompt, designStyle, colorPalette, 
      lighting, customInstructions, toolSlug, houseAngle, cameraAngle, 
      perspective, buildingType, roofType, environment, timeOfDay,
      projectId, manusChatId, userId, creditsCost
    } = dto;

    // Credit Verification & Deduction Logic
    const cost = Math.max(1, creditsCost || 1);
    let targetUser: UserDocument | null = null;

    if (userId && userId.length === 24) {
      targetUser = await this.userModel.findById(userId).exec();
    }
    if (!targetUser) {
      targetUser = await this.userModel.findOne({ email: 'test@yopmail.com' }).exec()
        || await this.userModel.findOne().exec();
    }

    if (targetUser) {
      const userCredits = targetUser.credits ?? 0;
      if (userCredits < cost) {
        throw new BadRequestException(
          `Insufficient credits! You have ${userCredits} credits remaining, but this generation requires ${cost} credit(s). Please top up your account or upgrade your plan.`
        );
      }
      targetUser.credits = Math.max(0, userCredits - cost);
      await targetUser.save();
      this.logger.log(`Deducted ${cost} credit(s) from user "${targetUser.email}". Remaining credits: ${targetUser.credits}`);
    }

    let targetTheme = designStyle || theme;
    let targetColorPalette = colorPalette || '';
    let targetLighting = lighting || '';
    let targetChatId = manusChatId || '';
    let activeProject: any = null;

    if (projectId) {
      try {
        activeProject = await this.projectsService.findOne(projectId);
        if (activeProject) {
          this.logger.log(`Locked generation to Project "${activeProject.name}" (ID: ${projectId}) with Theme: ${activeProject.theme}`);
          if (activeProject.theme) targetTheme = activeProject.theme;
          if (activeProject.colorPalette) targetColorPalette = activeProject.colorPalette;
          if (activeProject.lighting) targetLighting = activeProject.lighting;
          if (activeProject.manusChatId) targetChatId = activeProject.manusChatId;
        }
      } catch (err: any) {
        this.logger.warn(`Could not resolve Project ${projectId}: ${err.message}`);
      }
    }

    this.logger.log(`Enqueuing redesign job for ${targetTheme} ${roomType}...`);

    const resolvedOriginalImage = this.resolveDirectImageUrl(originalImage);

    // 1. Upload and preprocess the original input image via UploadsService
    const inputMediaFile = await this.uploadsService.registerUploadedFile({
      originalName: `input_${Date.now()}.jpg`,
      type: 'original_input',
      externalUrl: resolvedOriginalImage,
    });

    // 2. Insert the pending room generation document to act as our queue job payload
    const roomRecord: Record<string, any> = {
      originalImage: inputMediaFile.url,
      generatedImage: '',
      originalImageId: (inputMediaFile as any)._id,
      toolSlug: toolSlug || 'interior-design',
      roomType,
      buildingType: buildingType || 'House',
      roofType: roofType || '',
      environment: environment || '',
      timeOfDay: timeOfDay || '',
      houseAngle: houseAngle || '',
      cameraAngle: cameraAngle || '',
      perspective: perspective || '',
      theme: targetTheme,
      colorPalette: targetColorPalette,
      lighting: targetLighting,
      customInstructions: customInstructions || userPrompt || '',
      prompt: '',
      negativePrompt: '',
      creditsUsed: cost,
      status: 'pending',
      createdAt: new Date(),
    };

    if (targetUser) roomRecord.userId = targetUser._id;
    if (projectId) roomRecord.projectId = projectId;
    if (targetChatId) roomRecord.manusChatId = targetChatId;

    let createdRoom: RoomDocument;
    try {
      createdRoom = new this.roomModel(roomRecord);
      await createdRoom.save();
      if (projectId) {
        await this.projectsService.addRoomToProject(projectId, createdRoom._id);
      }
    } catch (e: any) {
      // Memory store fallback
      const memoryItem = {
        _id: `gen-${Date.now()}`,
        ...roomRecord,
        remainingCredits: targetUser ? targetUser.credits : 0,
      };
      this.inMemoryRooms.unshift(memoryItem);
      if (projectId) {
        await this.projectsService.addRoomToProject(projectId, memoryItem._id);
      }
      return memoryItem;
    }

    // 3. Blocking Wait: Poll the database for worker completion
    const startTime = Date.now();
    const timeoutMs = 70000; // 70 seconds limit for Replicate / OpenAI API operations
    const pollIntervalMs = 1500;

    this.logger.log(`Job enqueued (ID: ${createdRoom._id}). Waiting for QueueWorker...`);

    while (Date.now() - startTime < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      const currentRoom = await this.roomModel.findById(createdRoom._id).exec();
      
      if (currentRoom) {
        if (currentRoom.status === 'completed') {
          this.logger.log(`Job completed (ID: ${createdRoom._id}). Returning result.`);
          const resultObj: any = currentRoom.toObject ? currentRoom.toObject() : { ...currentRoom };
          if (targetUser) {
            resultObj.remainingCredits = targetUser.credits;
          }
          return resultObj;
        }
        if (currentRoom.status === 'failed') {
          this.logger.error(`Job failed (ID: ${createdRoom._id}). Error: ${currentRoom.error}`);
          throw new BadRequestException(`Image generation failed: ${currentRoom.error || 'Unknown error'}`);
        }
      }
    }

    // Mark as failed in DB on timeout
    await this.roomModel.findByIdAndUpdate(createdRoom._id, {
      $set: { status: 'failed', error: 'Generation timed out' },
    });

    throw new GatewayTimeoutException('Image generation request timed out. Please try again.');
  }

  /**
   * Direct Flux-only generation that does not upload or save files or save DB entries.
   */
  async generateRoomRedesign2(body: { imageUrl: string; prompt: string }): Promise<any> {
    const { imageUrl, prompt } = body;
    const resolvedUrl = this.resolveDirectImageUrl(imageUrl);
    this.logger.log(`Direct redesign request. Prompt: "${prompt.slice(0, 50)}...", Image URL: ${resolvedUrl}`);

    if (!prompt) {
      throw new BadRequestException('Prompt is required.');
    }

    try {
      const result = await this.providerManagerService.generateImage({
        prompt: prompt,
        imageUrl: resolvedUrl,
        negativePrompt: '',
      });

      return {
        success: true,
        imageUrl: result.imageUrl,
      };
    } catch (err: any) {
      this.logger.error(`Direct redesign failed. Error: ${err.message}`);
      throw new BadRequestException(`Redesign failed: ${err.message}`);
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
    } catch (e: any) {
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
   * Helper to parse and resolve direct Unsplash image downloads from photo page links
   */
  private resolveDirectImageUrl(url: string): string {
    if (!url) return url;

    // Matches Unsplash photo page patterns
    // e.g. https://unsplash.com/photos/hWwP4LTGEQA or https://unsplash.com/photos/some-slug-hWwP4LTGEQA
    const unsplashMatch = url.match(/unsplash\.com\/photos\/([a-zA-Z0-9_-]+)$/);
    if (unsplashMatch) {
      const segment = unsplashMatch[1];
      const id = segment.includes('-') ? segment.split('-').pop() : segment;
      const downloadUrl = `https://unsplash.com/photos/${id}/download`;
      this.logger.log(`Auto-resolved Unsplash page link to direct download: ${downloadUrl}`);
      return downloadUrl;
    }

    return url;
  }
}
