import { Injectable, Logger, NotFoundException, GatewayTimeoutException, BadRequestException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoomGeneration, RoomDocument } from './schemas/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { UploadsService } from '../modules/uploads/uploads.service';
import { ProviderManagerService } from '../modules/provider-manager/provider-manager.service';
import { ProjectsService } from '../modules/projects/projects.service';
import { User, UserDocument } from '../modules/users/schemas/user.schema';
import { QueueWorkerService } from '../queue/queue-worker.service';

import { SubscriptionService } from '../modules/subscription/subscription.service';

@Injectable()
export class RoomsService implements OnModuleInit {
  private readonly logger = new Logger(RoomsService.name);

  private inMemoryRooms: Array<any> = [];

  constructor(
    @InjectModel(RoomGeneration.name)
    private readonly roomModel: Model<RoomDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly uploadsService: UploadsService,
    private readonly providerManagerService: ProviderManagerService,
    private readonly projectsService: ProjectsService,
    private readonly queueWorkerService: QueueWorkerService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async onModuleInit() {
    try {
      this.logger.log('RoomsService initialized.');
    } catch (e) {
      this.logger.warn('Initial cleanup warning:', e);
    }
  }

  async removeAll(): Promise<{ success: boolean; message: string }> {
    await this.roomModel.deleteMany({}).exec();
    this.inMemoryRooms = [];
    return { success: true, message: 'All room generations cleared' };
  }

  /**
   * Server-calculated credit cost based on requested tool and parameters
   */
  calculateGenerationCost(toolSlug?: string): number {
    const tool = toolSlug || 'interior-design';
    if (['3d-floor-plan', 'sketch-to-render', '8k-render'].includes(tool)) {
      return 4;
    }
    return 2;
  }

  /**
   * Triggers room redesign generation with atomic credit deduction and auto-refund
   */
  async generateRoomRedesign(authenticatedUserId: string, dto: CreateRoomDto): Promise<any> {
    const { 
      originalImage, roomType, theme, userPrompt, designStyle, colorPalette, 
      lighting, customInstructions, toolSlug, houseAngle, cameraAngle, 
      perspective, buildingType, roofType, environment, timeOfDay,
      projectId, manusChatId
    } = dto;

    const requestedTool = toolSlug || 'interior-design';
    const cost = this.calculateGenerationCost(requestedTool);

    let targetUser: UserDocument | null = null;
    if (authenticatedUserId && authenticatedUserId.length === 24) {
      targetUser = await this.userModel.findById(authenticatedUserId).exec();
    }
    if (!targetUser) {
      targetUser = await this.userModel.findOne().exec();
    }

    if (!targetUser) {
      throw new NotFoundException('User account not found for generation');
    }

    // 1. Verify plan tool access
    const userPlanCode = targetUser.plan || 'free';
    try {
      const planDefinition = await this.userModel.db.model('SubscriptionPlanDefinition').findOne({
        code: userPlanCode.toLowerCase(),
        isActive: true,
      }).exec();

      if (planDefinition) {
        const allowedModels = planDefinition.accessibleModels || [];
        if (!allowedModels.includes(requestedTool)) {
          throw new ForbiddenException(
            `Your active ${userPlanCode.toUpperCase()} subscription tier does not have access to the "${requestedTool}" tool. Please upgrade your plan in the billing tab to unlock this feature.`
          );
        }
      }
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      this.logger.warn(`Failed to verify model access boundaries for plan ${userPlanCode}: ${err.message}`);
    }

    // 2. Atomic credit deduction
    targetUser = await this.subscriptionService.deductCreditsAtomic(
      targetUser._id.toString(),
      cost,
      `AI Generation Deducted: ${requestedTool} (${roomType})`,
      { toolSlug: requestedTool, roomType },
    );

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
      flooringMaterial: dto.flooringMaterial || '',
      flooringFinish: dto.flooringFinish || '',
      flooringGrout: dto.flooringGrout || '',
      furnitureHandling: dto.furnitureHandling || '',
      budgetLevel: dto.budgetLevel || '',
      selectedProducts: dto.selectedProducts || [],
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

      // Trigger immediate worker execution for instant response
      this.queueWorkerService.triggerJobDirectly(createdRoom).catch((err) => {
        this.logger.error(`Direct worker execution encountered error: ${err.message}`);
      });
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

    // 3. Blocking Wait: Poll the database for worker completion (up to 10 minutes limit for Manus AI agent operations)
    const startTime = Date.now();
    const timeoutMs = 600000; // 10 minutes (600,000 ms) limit
    const pollIntervalMs = 2000;

    this.logger.log(`Job enqueued (ID: ${createdRoom._id}). Triggered QueueWorker directly.`);

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
          if (targetUser) {
            await this.subscriptionService.refundCreditsAtomic(
              targetUser._id.toString(),
              cost,
              'Auto-refund: Room redesign generation failed',
              { toolSlug: requestedTool, roomId: createdRoom._id },
            );
          }
          throw new BadRequestException(`Image generation failed: ${currentRoom.error || 'Unknown error'}`);
        }
      }
    }

    // Mark as failed in DB on timeout and issue credit refund
    await this.roomModel.findByIdAndUpdate(createdRoom._id, {
      $set: { status: 'failed', error: 'Generation timed out' },
    });

    if (targetUser) {
      await this.subscriptionService.refundCreditsAtomic(
        targetUser._id.toString(),
        cost,
        'Auto-refund: Room redesign generation timed out',
        { toolSlug: requestedTool, roomId: createdRoom._id },
      );
    }

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
  async testManusDirectly(body: { imageUrl?: string; prompt?: string }) {
    const startTime = Date.now();
    const prompt = body.prompt || 'Photorealistic 8K UHD architectural interior redesign of a Living Room in Modern Japandi style';
    const imageUrl = body.imageUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop';

    const useVertex = !!(process.env.VERTEX_API_KEY || process.env.GEMINI_API_KEY || process.env.GCP_PROJECT_ID);
    this.logger.log(`Direct Test requested using ${useVertex ? 'Google Vertex AI (Imagen 3)' : 'RoomWhiz AI'}. Prompt: "${prompt.slice(0, 60)}..."`);

    try {
      const output = useVertex
        ? await this.providerManagerService.generateImageWithVertex({ prompt, imageUrl })
        : await this.providerManagerService.generateImageWithRoomWhiz({ prompt, imageUrl });

      return {
        success: true,
        outputImageUrl: output.imageUrl,
        chatId: output.chatId,
        providerName: output.providerName,
        modelName: output.modelName,
        timeTakenMs: Date.now() - startTime,
      };
    } catch (err: any) {
      const errorDetail = err.response?.data?.error?.message || err.response?.data?.message || err.message;
      this.logger.error(`Direct Test failed: ${errorDetail}`);
      return {
        success: false,
        error: errorDetail,
        timeTakenMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Returns room design records scoped to user (or all if admin)
   */
  async findAllForUser(userId: string, isAdmin = false): Promise<any[]> {
    try {
      const filter = isAdmin ? {} : { userId };
      const mongoRooms = await this.roomModel.find(filter).sort({ createdAt: -1 }).exec();
      if (mongoRooms) {
        return mongoRooms;
      }
    } catch (e: any) {
      this.logger.warn(`MongoDB fetch fallback: ${e.message}`);
    }
    return this.inMemoryRooms.filter((r) => isAdmin || r.userId?.toString() === userId);
  }

  /**
   * Returns a single room design by ID with user ownership check
   */
  async findOneForUser(id: string, userId: string, isAdmin = false): Promise<any> {
    let room: any = null;
    try {
      if (id.length === 24) {
        room = await this.roomModel.findById(id).exec();
      }
    } catch (e) {}

    if (!room) {
      room = this.inMemoryRooms.find((r) => r._id === id);
    }

    if (!room) {
      throw new NotFoundException(`Room design with ID ${id} not found`);
    }

    if (!isAdmin && room.userId?.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to access this room design.');
    }

    return room;
  }

  /**
   * Deletes a room design record with user ownership check
   */
  async removeForUser(id: string, userId: string, isAdmin = false): Promise<{ success: boolean; id: string }> {
    const room = await this.findOneForUser(id, userId, isAdmin);
    if (room._id && room._id.length === 24) {
      await this.roomModel.findByIdAndDelete(room._id).exec();
    }
    this.inMemoryRooms = this.inMemoryRooms.filter((r) => r._id !== id);
    return { success: true, id };
  }

  /**
   * Helper to parse and resolve direct Unsplash image downloads from photo page links
   */
  private resolveDirectImageUrl(url: string): string {
    if (!url) return url;

    // Matches Unsplash photo page patterns e.g. https://unsplash.com/photos/shT_LaGUmYI
    const unsplashMatch = url.match(/unsplash\.com\/photos\/([a-zA-Z0-9_-]+)$/);
    if (unsplashMatch) {
      const segment = unsplashMatch[1];
      const id = segment.includes('-') ? segment.split('-').pop() : segment;
      const cdnUrl = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
      this.logger.log(`Auto-resolved Unsplash page link to direct CDN image: ${cdnUrl}`);
      return cdnUrl;
    }

    return url;
  }
}
