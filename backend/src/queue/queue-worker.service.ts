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

import { SubscriptionService } from '../modules/subscription/subscription.service';

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
    private readonly subscriptionService: SubscriptionService,
  ) {}

  onApplicationBootstrap() {
    this.logger.log('🚀 Queue Worker Service started.');
    // Start background processing loop
    setInterval(() => this.processQueue(), 3000);
    // Periodically run orphan recovery scan every 5 minutes
    setInterval(() => this.recoverOrphanPendingRooms(), 5 * 60 * 1000);
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

  /**
   * Scans for orphan processing/pending room jobs older than 10 minutes and performs reconciliation recovery
   */
  async recoverOrphanPendingRooms() {
    try {
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
      const orphanRooms = await this.roomModel.find({
        status: { $in: ['pending', 'processing'] },
        createdAt: { $lt: tenMinsAgo },
      }).exec();

      if (orphanRooms.length > 0) {
        this.logger.warn(`Found ${orphanRooms.length} orphaned room generation jobs older than 10 minutes. Executing reconciliation recovery...`);
        for (const orphan of orphanRooms) {
          orphan.status = 'failed';
          orphan.failureCode = 'TIMEOUT';
          orphan.error = 'Generation request timed out or backend process restarted before completion.';

          if (orphan.userId && orphan.creditsUsed && orphan.creditsUsed > 0 && !orphan.isRefunded) {
            try {
              await this.subscriptionService.refundCreditsAtomic(
                orphan.userId.toString(),
                orphan.creditsUsed,
                'Auto-refund: Stale generation reconciliation timeout',
                { roomId: orphan._id.toString(), toolSlug: orphan.toolSlug },
              );
              orphan.isRefunded = true;
            } catch (rErr: any) {
              this.logger.error(`Failed to execute orphan recovery refund for room ${orphan._id}: ${rErr.message}`);
            }
          }
          await orphan.save().catch(() => {});
        }
      }
    } catch (err: any) {
      this.logger.error(`Orphan recovery scan encountered error: ${err.message}`);
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
      // 1. Resolve image buffer from HTTP URL, Base64 data URL, or local storage adapter
      console.log(`📦 [IMAGE RETRIEVAL] Resolving original image buffer for job ${room._id}...`);
      let originalImageBuffer: Buffer;
      let mimeType = 'image/jpeg';

      const imgUrl = room.originalImage || '';
      if (imgUrl.startsWith('data:image/')) {
        const parts = imgUrl.split(';');
        const mime = parts[0].replace('data:', '');
        if (mime) mimeType = mime;
        const base64Data = imgUrl.split(',')[1] || imgUrl;
        originalImageBuffer = Buffer.from(base64Data, 'base64');
      } else if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
        try {
          const resp = await axios.get(imgUrl, {
            responseType: 'arraybuffer',
            timeout: 15000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'image/*,*/*',
            },
          });
          originalImageBuffer = Buffer.from(resp.data);
          const contentType = String(resp.headers['content-type'] || '');
          if (contentType.startsWith('image/')) {
            mimeType = contentType.split(';')[0];
          }
        } catch (httpErr: any) {
          this.logger.error(`Failed to download remote original image from ${imgUrl}: ${httpErr.message}`);
          throw new Error(`SOURCE_IMAGE_FETCH_FAILED: Could not download image from provided URL (${httpErr.message})`);
        }
      } else {
        const relativePath = imgUrl.replace(/^\/?uploads\//, '');
        try {
          originalImageBuffer = await this.storageService.retrieve(relativePath);
          const ext = path.extname(imgUrl).toLowerCase();
          if (ext === '.png') mimeType = 'image/png';
          else if (ext === '.webp') mimeType = 'image/webp';
        } catch (err: any) {
          this.logger.error(`Failed to retrieve original image from local storage: ${err.message}`);
          throw err;
        }
      }
      console.log(`   - Preprocessed image loaded: Size: ${(originalImageBuffer.length / 1024).toFixed(1)} KB | Format: ${mimeType}`);

      const base64Image = `data:${mimeType};base64,${originalImageBuffer.toString('base64')}`;

      // 2. Compile prompt using Vision AI and modular engine
      this.logger.log(`Step 1: Building structural prompt and analyzing original room image...`);
      console.log(`🔍 [VISION AI] Calling OpenAI GPT-4o Vision to analyze the uploaded room structure...`);
      
      // Fetch project details (designTheme and existing manusTaskId) if room belongs to a project
      let projectDesignTheme: Record<string, any> | undefined = undefined;
      let effectiveTaskId: string | undefined = room.manusTaskId || room.manusChatId || undefined;

      if (room.projectId) {
        try {
          const activeProj = await this.projectsService.findOne(String(room.projectId));
          if (activeProj) {
            if (activeProj.designTheme) {
              projectDesignTheme = activeProj.designTheme;
              this.logger.log(`Injected structured Project DesignTheme into prompt payload for Project "${activeProj.name}"`);
            }
            const projectTaskId = activeProj.manusTaskId || activeProj.manusChatId;
            if (projectTaskId) {
              effectiveTaskId = projectTaskId;
              this.logger.log(`🔗 Reusing Authoritative Master Manus Task ID "${effectiveTaskId}" for Project "${activeProj.name}"`);
            }
          }
        } catch (projErr: any) {
          this.logger.warn(`Could not resolve project details: ${projErr.message}`);
        }
      }

      const promptResult = await this.promptBuilderService.buildPromptWithImageAnalysis({
        imageUrl: base64Image,
        originalImage: room.originalImage,
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
        furnitureHandling: room.furnitureHandling,
        selectedProducts: room.selectedProducts,
        budgetLevel: room.budgetLevel,
        designTheme: projectDesignTheme,
      });

      const { finalPrompt, negativePrompt } = promptResult;
      console.log(`\n=================== 🚀 EXACT PROMPT SENT TO MANUS API 🚀 ===================`);
      console.log(finalPrompt);
      console.log(`============================================================================\n`);

      // Fetch existing project image URLs for result correlation
      let existingProjectImages: string[] = [];
      if (room.projectId) {
        try {
          existingProjectImages = await this.projectsService.getAllProjectImageUrls(String(room.projectId));
        } catch (e) {
          // Ignore
        }
      }

      this.logger.log(`[GENERATION] generationId=${room._id} projectId=${room.projectId || 'N/A'} manusTaskId=${effectiveTaskId || 'NEW'} operation=${effectiveTaskId ? 'SEND_MESSAGE' : 'CREATE_TASK'} status=RUNNING`);

      const generationResult = await this.providerManagerService.generateImage({
        prompt: finalPrompt,
        negativePrompt: negativePrompt,
        imageBuffer: originalImageBuffer,
        imageMimeType: mimeType,
        imageUrl: room.originalImageUrl || room.originalImage,
        originalImageUrl: room.originalImageUrl || (room.originalImage && room.originalImage.startsWith('http') ? room.originalImage : ''),
        manusTaskId: effectiveTaskId,
        chatId: effectiveTaskId,
        projectId: room.projectId ? String(room.projectId) : undefined,
        generationId: String(room._id),
        existingImageUrls: existingProjectImages,
        onProgress: (progressData: { statusText: string; steps: any[] }) => {
          room.stepStatus = progressData.statusText;
          if (progressData.steps && progressData.steps.length > 0) {
            room.workflowSteps = progressData.steps;
          }
          room.save().catch(() => {});
          this.logger.log(`[LIVE PROGRESS UPDATE] [GEN-${room._id}] ${progressData.statusText}`);
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
      const rawImageUrls = Array.isArray(generationResult.generatedImages) && generationResult.generatedImages.length > 0
        ? generationResult.generatedImages
        : [generationResult.imageUrl];

      this.logger.log(`📥 [PERMANENT STORAGE] Processing ${rawImageUrls.length} generated render image(s) from provider...`);

      const storedImageUrls: string[] = [];
      let primaryMediaFileId: any = null;

      for (let imgIdx = 0; imgIdx < rawImageUrls.length; imgIdx++) {
        const outputUrl = rawImageUrls[imgIdx];
        let generatedBuffer: Buffer | null = null;
        let generatedMimeType = 'image/png';

        if (outputUrl.startsWith('/uploads/') || outputUrl.startsWith('uploads/')) {
          const cleanPath = outputUrl.replace(/^\/?uploads\//, '');
          try {
            generatedBuffer = await this.storageService.retrieve(cleanPath);
            storedImageUrls.push(outputUrl);
            continue;
          } catch (sErr: any) {
            this.logger.error(`Could not retrieve generated render from disk (${cleanPath}): ${sErr.message}`);
          }
        }

        let lastDlErr: any;
        for (let dlAttempt = 1; dlAttempt <= 3; dlAttempt++) {
          try {
            const downloadResponse = await axios.get(outputUrl, { responseType: 'arraybuffer', timeout: 45000 });
            generatedBuffer = Buffer.from(downloadResponse.data);
            if (downloadResponse.headers['content-type']) {
              generatedMimeType = String(downloadResponse.headers['content-type']);
            }
            lastDlErr = null;
            break;
          } catch (dlErr: any) {
            lastDlErr = dlErr;
            this.logger.warn(`Attempt ${dlAttempt}/3 failed to download generated image (${outputUrl.slice(0, 80)}): ${dlErr.message}`);
            if (dlAttempt < 3) await new Promise((r) => setTimeout(r, 2000));
          }
        }

        if (generatedBuffer && generatedBuffer.length > 0) {
          const outputMediaFile = await this.uploadsService.registerUploadedFile({
            originalName: `render_${imgIdx + 1}_${Date.now()}.jpg`,
            type: 'ai_generated',
            buffer: generatedBuffer,
            mimeType: generatedMimeType,
            size: generatedBuffer.length,
          });

          if (outputMediaFile && outputMediaFile.url) {
            storedImageUrls.push(outputMediaFile.url);
            if (!primaryMediaFileId) primaryMediaFileId = (outputMediaFile as any)._id;
          }
        }
      }

      if (storedImageUrls.length === 0) {
        throw new Error('GENERATION_RESULT_MISSING: Could not download or persist any generated render images.');
      }

      // 6. Complete database update & update project master manusTaskId atomically
      const primaryRenderUrl = storedImageUrls[storedImageUrls.length - 1];
      room.generatedImage = primaryRenderUrl;
      room.generatedImages = storedImageUrls;
      if (primaryMediaFileId) room.generatedImageId = primaryMediaFileId;
      room.prompt = finalPrompt;
      room.negativePrompt = negativePrompt;

      const returnedTaskId = generationResult.manusTaskId || generationResult.chatId;
      if (returnedTaskId) {
        room.manusTaskId = returnedTaskId;
        room.manusChatId = returnedTaskId;

        if (room.projectId) {
          try {
            await this.projectsService.setMasterTaskIdAtomic(
              String(room.projectId),
              returnedTaskId,
              'PRIMARY',
              generationResult.isNewTask ? 'initial_project_task' : 'continued_project_task'
            );
          } catch (projErr: any) {
            this.logger.warn(`Could not update Project master task ID: ${projErr.message}`);
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
      room.failureCode = errMsg.includes('SOURCE_IMAGE_UNAVAILABLE')
        ? 'SOURCE_IMAGE_UNAVAILABLE'
        : errMsg.includes('GENERATION_RESULT_MISSING')
          ? 'GENERATION_RESULT_MISSING'
          : 'GENERATION_FAILED';

      if (room.workflowSteps && room.workflowSteps.length > 0) {
        const runningIdx = room.workflowSteps.findIndex((s: any) => s.status === 'running');
        const targetIdx = runningIdx >= 0 ? runningIdx : 0;
        room.workflowSteps = room.workflowSteps.map((s: any, i: number) => ({
          ...s,
          status: i === targetIdx ? 'failed' : s.status === 'completed' ? 'completed' : 'pending',
        }));
      }

      // Rule #15: Atomic credit refund on failure
      if (room.userId && room.creditsUsed > 0 && !room.isRefunded) {
        try {
          await this.subscriptionService.refundCreditsAtomic(
            room.userId.toString(),
            room.creditsUsed,
            `Auto-refund: Generation failed (${errMsg})`,
            { roomId: room._id.toString() },
          );
          room.isRefunded = true;
        } catch (refundErr: any) {
          this.logger.warn(`Could not issue atomic credit refund for room ${room._id}: ${refundErr.message}`);
        }
      }

      await room.save().catch(() => {});

      console.log('\n========================================================================');
      console.log(`❌ [PIPELINE FAILED] Room Redesign aborted (ID: ${room._id})`);
      console.log(`   - Failure Code: ${room.failureCode}`);
      console.log(`   - Error: ${errMsg}`);
      console.log('========================================================================\n');
    }
  }
}
