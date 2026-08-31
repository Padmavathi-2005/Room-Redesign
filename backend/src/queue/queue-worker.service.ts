import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoomGeneration, RoomDocument } from '../rooms/schemas/room.schema';
import { PromptBuilderService } from '../modules/prompt/prompt-builder.service';
import { UploadsService } from '../modules/uploads/uploads.service';
import { ProviderManagerService } from '../modules/provider-manager/provider-manager.service';
import { StorageService } from '../modules/storage/storage.service';
import { ProjectsService } from '../modules/projects/projects.service';
import { SAMPLE_FALLBACK_IMAGES } from '../modules/provider-manager/providers/fallback-studio.provider';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class QueueWorkerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(QueueWorkerService.name);
  private isProcessing = false;

  constructor(
    @InjectModel(RoomGeneration.name)
    private readonly roomModel: Model<RoomDocument>,
    private readonly promptBuilderService: PromptBuilderService,
    private readonly uploadsService: UploadsService,
    private readonly providerManagerService: ProviderManagerService,
    private readonly storageService: StorageService,
    private readonly projectsService: ProjectsService,
  ) {}

  onApplicationBootstrap() {
    this.logger.log('🚀 Queue Worker Service started.');
    // Start background processing loop
    setInterval(() => this.processQueue(), 3000);
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Find next pending job and atomically set to processing
      const room = await this.roomModel.findOneAndUpdate(
        { status: 'pending' },
        { $set: { status: 'processing' } },
        { sort: { createdAt: 1 }, new: true },
      ).exec();

      if (room) {
        this.logger.log(`Locked and processing redesign job for room ID: ${room._id}`);
        await this.executeJob(room);
      }
    } catch (err: any) {
      this.logger.error(`Error in queue processing loop: ${err.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  async triggerJobDirectly(room: RoomDocument) {
    this.logger.log(`Triggering immediate processing for room job ID: ${room._id}`);
    const updated = await this.roomModel.findByIdAndUpdate(
      room._id,
      { $set: { status: 'processing' } },
      { new: true }
    );
    if (updated) {
      await this.executeJob(updated);
    }
  }

  private async executeJob(room: RoomDocument) {
    console.log('\n========================================================================');
    console.log(`🚀 [PIPELINE START] Processing Room Redesign (Job ID: ${room._id})`);
    console.log(`   - Room Type: ${room.roomType} | Theme: ${room.theme}`);
    console.log(`   - Uploaded Image Type: ${room.originalImage.startsWith('data:image/') ? 'Base64 Data URL' : 'HTTP/Static URL'}`);
    console.log('========================================================================\n');

    try {
      // 1. Resolve relative path and load image buffer from storage adapter
      console.log(`📦 [IMAGE RETRIEVAL] Resolving and retrieving original image from storage...`);
      const relativePath = room.originalImage.replace(/^\/?uploads\//, '');
      let originalImageBuffer: Buffer;
      let mimeType = 'image/jpeg';
      try {
        originalImageBuffer = await this.storageService.retrieve(relativePath);
        const ext = path.extname(room.originalImage).toLowerCase();
        if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.webp') mimeType = 'image/webp';
      } catch (err: any) {
        this.logger.error(`Failed to retrieve original image from storage: ${err.message}`);
        throw err;
      }
      console.log(`   - Preprocessed image loaded: Size: ${(originalImageBuffer.length / 1024).toFixed(1)} KB | Format: ${mimeType}`);

      const base64Image = `data:${mimeType};base64,${originalImageBuffer.toString('base64')}`;

      // 2. Compile prompt using Vision AI and modular engine
      this.logger.log(`Step 1: Building structural prompt and analyzing original room image...`);
      console.log(`🔍 [VISION AI] Calling OpenAI GPT-4o Vision to analyze the uploaded room structure...`);
      
      // Fetch project designTheme if room belongs to a project
      let projectDesignTheme: Record<string, any> | undefined = undefined;
      if (room.projectId) {
        try {
          const activeProj = await this.projectsService.findOne(String(room.projectId));
          if (activeProj && activeProj.designTheme) {
            projectDesignTheme = activeProj.designTheme;
            this.logger.log(`Injected structured Project DesignTheme into prompt payload for Project "${activeProj.name}"`);
          }
        } catch (projErr: any) {
          this.logger.warn(`Could not resolve project designTheme: ${projErr.message}`);
        }
      }

      const promptResult = await this.promptBuilderService.buildPromptWithImageAnalysis({
        imageUrl: base64Image, // Now it is a base64 Data URL!
        roomType: room.roomType,
        theme: room.theme,
        colorPalette: room.colorPalette,
        lighting: room.lighting,
        customInstructions: room.customInstructions,
        toolSlug: room.toolSlug,
        houseAngle: room.houseAngle,
        cameraAngle: room.cameraAngle,
        perspective: room.perspective,
        buildingType: room.buildingType,
        roofType: room.roofType,
        environment: room.environment,
        timeOfDay: room.timeOfDay,
        flooringMaterial: room.flooringMaterial,
        flooringFinish: room.flooringFinish,
        flooringGrout: room.flooringGrout,
        designTheme: projectDesignTheme,
      });

      const { finalPrompt, negativePrompt } = promptResult;
      console.log(`\n=================== 🚀 EXACT PROMPT SENT TO MANUS API 🚀 ===================`);
      console.log(finalPrompt);
      console.log(`============================================================================\n`);

      // 3. Dispatch image generation request to ProviderManager
      this.logger.log(`Step 2: Dispatching job payload to provider manager...`);
      
      const rawKey = process.env.MANUS_API_KEYS || process.env.MANUS_API_KEY || '';
      const isManusConfigured = !!(rawKey && rawKey.trim().replace(/^["']|["']$/g, '') !== '');
      
      console.log(`📡 [ROUTING INFO] Active API Tokens in .env:`);
      console.log(`   - Manus API Key Configured: ${isManusConfigured ? 'YES (Active)' : 'NO'}`);

      const generationResult = await this.providerManagerService.generateImage({
        prompt: finalPrompt,
        negativePrompt: negativePrompt,
        imageBuffer: originalImageBuffer,
        imageMimeType: mimeType,
        imageUrl: room.originalImage, // Passed to check absolute URLs for cloud fetchers
        chatId: room.manusChatId,
        projectId: room.projectId ? String(room.projectId) : undefined,
        onProgress: (progressData: { statusText: string; steps: any[] }) => {
          room.stepStatus = progressData.statusText;
          if (progressData.steps && progressData.steps.length > 0) {
            room.workflowSteps = progressData.steps;
          }
          room.save().catch(() => {});
          this.logger.log(`[LIVE PROGRESS UPDATE] ${progressData.statusText}`);
        },
      });

      console.log(`🎨 [AI GENERATOR RESPONDED]`);
      console.log(`   - Selected Provider: ${generationResult.providerName}`);
      console.log(`   - Active Model: ${generationResult.modelName}`);
      console.log(`   - Transaction Cost: $${generationResult.costUSD} USD`);
      if (generationResult.chatId) {
        console.log(`   - Chat/Session ID: ${generationResult.chatId}`);
      }

      // 4. Download generated image for permanent storage
      this.logger.log(`Step 3: Downloading generated image from temporary URL for permanent storage...`);
      console.log(`📥 [PERMANENT STORAGE] Downloading image from provider: ${generationResult.imageUrl.slice(0, 100)}...`);
      
      let generatedBuffer: Buffer;
      let generatedMimeType = 'image/png';
      const outputUrl = generationResult.imageUrl;

      if (outputUrl.startsWith('/uploads/') || outputUrl.startsWith('uploads/')) {
        const cleanPath = outputUrl.replace(/^\/?uploads\//, '');
        try {
          generatedBuffer = await this.storageService.retrieve(cleanPath);
          this.logger.log(`✅ Loaded generated render buffer directly from local disk: ${cleanPath}`);
        } catch (sErr: any) {
          this.logger.warn(`Could not retrieve ${cleanPath} from disk (${sErr.message}). Using fallback render buffer.`);
          generatedBuffer = await this.storageService.retrieve('generated/floor_plan_generator_after.png').catch(() => originalImageBuffer);
        }
      } else {
        try {
          const downloadResponse = await axios.get(outputUrl, { responseType: 'arraybuffer', timeout: 10000 });
          generatedBuffer = Buffer.from(downloadResponse.data);
          if (downloadResponse.headers['content-type']) {
            generatedMimeType = String(downloadResponse.headers['content-type']);
          }
        } catch (dlErr: any) {
          this.logger.error(`Could not download generated image from Manus AI URL (${outputUrl}): ${dlErr.message}`);
          throw new Error(`Failed to download generated image from Manus AI: ${dlErr.message}`);
        }
      }

      // 5. Register generated output image permanently
      const outputMediaFile = await this.uploadsService.registerUploadedFile({
        originalName: `output_${Date.now()}.jpg`,
        type: 'ai_generated',
        buffer: generatedBuffer,
        mimeType: generatedMimeType,
        size: generatedBuffer.length,
      });

      // 6. Complete database update & update project manusChatId if available
      room.generatedImage = outputMediaFile.url;
      room.generatedImageId = (outputMediaFile as any)._id;
      room.prompt = finalPrompt;
      room.negativePrompt = negativePrompt;
      if (generationResult.chatId) {
        room.manusChatId = generationResult.chatId;
        if (room.projectId) {
          try {
            await this.projectsService.updateChatId(String(room.projectId), generationResult.chatId);
          } catch (projErr: any) {
            this.logger.warn(`Could not update Project manusChatId: ${projErr.message}`);
          }
        }
      }
      
      // Mark all workflow steps as completed
      if (room.workflowSteps && room.workflowSteps.length > 0) {
        room.workflowSteps = room.workflowSteps.map((s: any) => ({ ...s, status: 'completed' }));
      }
      room.status = 'completed';
      await room.save();

      console.log('\n========================================================================');
      console.log(`✅ [PIPELINE SUCCESS] Room Redesign completed successfully (ID: ${room._id})`);
      console.log(`   - Output stored permanently: ${room.generatedImage}`);
      console.log('========================================================================\n');
    } catch (err: any) {
      const errMsg = err.message || 'Unknown error occurred';
      this.logger.error(`❌ Generation job failed for room ID: ${room._id}. Error: ${errMsg}`);
      room.status = 'failed';
      room.error = errMsg;
      if (room.workflowSteps && room.workflowSteps.length > 0) {
        const runningIdx = room.workflowSteps.findIndex((s: any) => s.status === 'running');
        const targetIdx = runningIdx >= 0 ? runningIdx : 0;
        room.workflowSteps = room.workflowSteps.map((s: any, i: number) => ({
          ...s,
          status: i === targetIdx ? 'error' : s.status === 'completed' ? 'completed' : 'pending',
        }));
      }
      await room.save();

      console.log('\n========================================================================');
      console.log(`❌ [PIPELINE FAILED] Room Redesign aborted (ID: ${room._id})`);
      console.log(`   - Error: ${errMsg}`);
      console.log('========================================================================\n');
    }
  }
}
