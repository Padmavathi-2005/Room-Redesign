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
import { SettingsService } from '../modules/settings/settings.service';

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
    private readonly settingsService: SettingsService,
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
   * Server-calculated credit cost based on requested tool specs in DB
   */
  async calculateGenerationCost(toolSlug?: string): Promise<number> {
    const tool = toolSlug || 'interior-design';

    // Direct per-tool credit cost mapping
    if (['8k-render', 'video-walkthrough'].includes(tool)) {
      return 6;
    }
    if (['3d-floor-plan', 'sketch-to-render'].includes(tool)) {
      return 4;
    }
    if (['commercial-makeover', 'ai-flooring-design', 'change-furniture-ai'].includes(tool)) {
      return 3;
    }
    if (['paint-color-visualizer', 'change-room-light', 'paint-textures', 'sky-weather-swap'].includes(tool)) {
      return 2;
    }

    return 4; // Default tool credit cost
  }

  /**
   * Triggers room redesign generation with atomic credit deduction and auto-refund
   */
  async generateRoomRedesign(authenticatedUserId: string, dto: CreateRoomDto): Promise<any> {
    const { 
      originalImage, roomType, theme, userPrompt, designStyle, colorPalette, 
      lighting, customInstructions, customRequirements, toolSlug, houseAngle, cameraAngle, 
      perspective, buildingType, roofType, environment, timeOfDay,
      projectId, manusChatId
    } = dto;

    const requestedTool = toolSlug || 'interior-design';
    const cost = await this.calculateGenerationCost(requestedTool);

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

    let targetTheme = designStyle || theme;
    let targetColorPalette = colorPalette || '';
    let targetLighting = lighting || '';
    let targetChatId = manusChatId || '';
    let targetProjectId = projectId || '';
    let activeProject: any = null;

    const targetProjectIdOrName = targetProjectId || dto.projectName;

    if (targetProjectIdOrName) {
      try {
        activeProject = await this.projectsService.findOneOrByName(targetProjectIdOrName, targetUser._id?.toString());
        if (activeProject) {
          // Rule: Verify authenticated user owns the target project
          if (activeProject.userId && targetUser._id && activeProject.userId.toString() !== targetUser._id.toString()) {
            throw new ForbiddenException('You do not have permission to generate redesigns within this project.');
          }

          this.logger.log(`Locked generation to Project "${activeProject.name}" (ID: ${activeProject._id}) with Theme: ${activeProject.theme}`);
          if (activeProject.theme) targetTheme = activeProject.theme;
          if (activeProject.colorPalette) targetColorPalette = activeProject.colorPalette;
          if (activeProject.lighting) targetLighting = activeProject.lighting;
          
          // Authoritative DB Source of Truth: Resolve master manusTaskId from Project
          targetChatId = activeProject.manusTaskId || activeProject.manusChatId || '';
          if (targetChatId) {
            this.logger.log(`🔗 Authoritative Master Manus Task ID resolved from Project DB: ${targetChatId}`);
          } else {
            this.logger.log(`ℹ️ Project "${activeProject.name}" has no existing Manus Task. First generation will call task.create.`);
          }

          // Ensure projectId on room record is the actual resolved ObjectId
          if (activeProject._id) {
            targetProjectId = activeProject._id.toString();
          }
        } else {
          this.logger.warn(`Project lookup returned null for query: ${targetProjectIdOrName}`);
        }
      } catch (err: any) {
        if (err instanceof ForbiddenException) throw err;
        this.logger.warn(`Could not resolve Project ${targetProjectIdOrName}: ${err.message}`);
      }
    }

    const resolvedOriginalImage = await this.resolveDirectImageUrl(originalImage);

    // 1. Pre-validate and upload original source image BEFORE credit deduction (Rule #4)
    let inputMediaFile: any;
    try {
      inputMediaFile = await this.uploadsService.registerUploadedFile({
        originalName: `input_${Date.now()}.jpg`,
        type: 'original_input',
        externalUrl: resolvedOriginalImage,
      });
    } catch (uploadErr: any) {
      this.logger.error(`Source image validation failed: ${uploadErr.message}`);
      throw new BadRequestException(`SOURCE_IMAGE_UNAVAILABLE: Could not validate or access provided source image (${uploadErr.message})`);
    }

    const genIdempotencyKey = dto.idempotencyKey || `gen-${targetUser._id.toString()}-${Date.now()}`;

    const formattedToolName = requestedTool === '3d-floor-plan' ? '3D Floor Plan'
      : requestedTool === 'sketch-to-render' ? 'Sketch to Render'
      : requestedTool === '8k-render' ? '8K Render'
      : 'Interior Design';

    const formattedRoomType = (roomType || 'Living Room')
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const initialWorkflowSteps = [
      { id: '1', title: 'Vision AI Room Analysis', status: 'in_progress', timestamp: 'Just now' },
      { id: '2', title: `Generating ${formattedToolName} (${targetTheme} Theme)`, status: 'pending' },
      { id: '3', title: `Rendering ${formattedRoomType}`, status: 'pending' },
      { id: '4', title: 'Final Image Optimization & Upscaling', status: 'pending' },
    ];

    // Deduct user credits atomically BEFORE processing (Rule #4)
    let freshDeductedUser = null;
    try {
      freshDeductedUser = await this.subscriptionService.deductCreditsAtomic(
        targetUser._id.toString(),
        cost,
        `AI Room Redesign (${formattedToolName})`,
        { toolSlug: requestedTool, roomType, theme: targetTheme }
      );
    } catch (err: any) {
      this.logger.warn(`deductCreditsAtomic fallback: ${err.message}`);
    }

    if (!freshDeductedUser) {
      await this.userModel.findByIdAndUpdate(targetUser._id, {
        $inc: { credits: -cost },
      }).exec();
    }
    this.logger.log(`Deducted ${cost} credits from User ${targetUser._id}. New Balance: ${freshDeductedUser?.credits ?? 'calculated'}.`);

    // 2. Insert the pending room generation document to act as our queue job payload
    const roomRecord: any = {
      originalImage: inputMediaFile?.url || resolvedOriginalImage,
      originalImageUrl: resolvedOriginalImage && resolvedOriginalImage.startsWith('http') ? resolvedOriginalImage : '',
      generatedImage: '',
      originalImageId: inputMediaFile._id,
      toolSlug: requestedTool,
      roomType,
      workflowSteps: initialWorkflowSteps,
      currentStep: 1,
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
      customInstructions: customInstructions || customRequirements || userPrompt || (dto as any).customRequirements || '',
      customRequirements: customRequirements || customInstructions || userPrompt || '',
      userPrompt: userPrompt || customInstructions || customRequirements || '',
      prompt: '',
      negativePrompt: '',
      creditsUsed: cost,
      status: 'pending',
      createdAt: new Date(),
    };

    if (targetUser) roomRecord.userId = targetUser._id;
    if (targetProjectId) roomRecord.projectId = targetProjectId;
    if (targetChatId) {
      roomRecord.manusTaskId = targetChatId;
      roomRecord.manusChatId = targetChatId;
    }

    let createdRoom: RoomDocument;
    try {
      createdRoom = new this.roomModel(roomRecord);
      await createdRoom.save();
      if (targetProjectId) {
        await this.projectsService.addRoomToProject(targetProjectId, createdRoom._id);
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
            const freshUser = await this.userModel.findById(targetUser._id).exec();
            resultObj.remainingCredits = freshUser ? freshUser.credits : targetUser.credits;
          }
          return resultObj;
        }
        if (currentRoom.status === 'failed') {
          this.logger.error(`Job failed (ID: ${createdRoom._id}). Error: ${currentRoom.error}`);
          let freshCredits = 0;
          if (targetUser) {
            const refundedUser = await this.subscriptionService.refundCreditsAtomic(
              targetUser._id.toString(),
              cost,
              `Auto-Refund: AI Generation Failed (${formattedToolName})`,
              { toolSlug: requestedTool, roomId: createdRoom._id },
            );
            freshCredits = refundedUser?.credits ?? 0;
          }

          let rawErr = currentRoom.error || 'Unknown error';
          let userFriendlyReason = rawErr;
          if (rawErr.includes('402') || rawErr.includes('Quota') || rawErr.includes('429') || rawErr.includes('API key') || rawErr.includes('failed')) {
            userFriendlyReason = `AI Provider capacity or quota temporarily reached. Your ${cost} credits were automatically refunded to your balance (${freshCredits} credits remaining).`;
          }

          throw new BadRequestException(userFriendlyReason);
        }
      }
    }

    // Mark as failed in DB on timeout and issue credit refund
    await this.roomModel.findByIdAndUpdate(createdRoom._id, {
      $set: { status: 'failed', error: 'Generation timed out' },
    });

    let freshCredits = 0;
    if (targetUser) {
      const refundedUser = await this.subscriptionService.refundCreditsAtomic(
        targetUser._id.toString(),
        cost,
        `Auto-Refund: AI Generation Timed Out (${formattedToolName})`,
        { toolSlug: requestedTool, roomId: createdRoom._id },
      );
      freshCredits = refundedUser?.credits ?? 0;
    }

    throw new GatewayTimeoutException(`Image generation request timed out after 10 minutes. Your ${cost} credits were automatically refunded (${freshCredits} credits remaining).`);
  }

  /**
   * Direct Flux-only generation that does not upload or save files or save DB entries.
   */
  async generateRoomRedesign2(body: { imageUrl: string; prompt: string }): Promise<any> {
    const { imageUrl, prompt } = body;
    const resolvedUrl = await this.resolveDirectImageUrl(imageUrl);
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
   * Retrieves real live execution status and workflow steps for a generation job
   */
  async getRoomStatus(id: string): Promise<Record<string, any>> {
    let room: any = null;
    try {
      if (id && id.length === 24) {
        room = await this.roomModel.findById(id).exec();
      }
    } catch (e) {
      // Ignore invalid ObjectId
    }

    if (!room) {
      room = this.inMemoryRooms.find((r) => r._id === id || r.id === id);
    }

    if (!room) {
      throw new NotFoundException(`Generation job with ID "${id}" was not found.`);
    }

    const isCompleted = room.status === 'completed' && Boolean(room.generatedImage);
    const isFailed = room.status === 'failed' || (room.status === 'completed' && !room.generatedImage);
    const effectiveStatus = isCompleted ? 'completed' : isFailed ? 'failed' : room.status || 'pending';

    return {
      generationId: room._id || room.id || id,
      roomId: room._id || room.id || id,
      status: effectiveStatus,
      failureCode: room.failureCode || (isFailed && !room.generatedImage ? 'GENERATION_RESULT_MISSING' : ''),
      error: room.error || (isFailed && !room.generatedImage ? 'AI generation task finished but no valid image was returned.' : ''),
      originalImage: room.originalImage || '',
      generatedImage: isCompleted ? room.generatedImage : '',
      stepStatus: room.stepStatus || '',
      workflowSteps: room.workflowSteps || [
        { id: 'source-image', name: 'Locate Source Interior Image', status: 'completed' },
        { id: 'direction-prepare', name: 'Prepare Visual Redesign Direction', status: isCompleted ? 'completed' : 'running' },
        { id: 'generate-render', name: 'Generate High-Precision Architectural Render', status: isCompleted ? 'completed' : 'pending' },
        { id: 'verify-result', name: 'Verify Image Quality & Style', status: isCompleted ? 'completed' : 'pending' }
      ],
      createdAt: room.createdAt,
      updatedAt: room.updatedAt || room.createdAt,
    };
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
   * Helper to parse and resolve direct image URLs from web page links (Unsplash, Pexels, Pinterest, etc.)
   */
  private async resolveDirectImageUrl(url: string): Promise<string> {
    if (!url) return url;
    try {
      const resolved = await this.uploadsService.resolveWebPageImageUrl(url);
      if (resolved) return resolved;
    } catch (e: any) {
      this.logger.warn(`Failed to resolve direct image URL for "${url}": ${e.message}`);
    }
    return url;
  }
}
