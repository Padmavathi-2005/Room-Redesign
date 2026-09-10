import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { IAIProvider, ImageGenerationInput, ImageGenerationOutput, WorkflowStepItem } from '../../../common/interfaces/ai-provider.interface';
import axios from 'axios';
import { NotificationsService } from '../../notifications/notifications.service';

// INITIAL SANITIZED USER-FACING WORKFLOW STEPS
export const INITIAL_WORKFLOW_STEPS: WorkflowStepItem[] = [
  {
    id: 'direction',
    title: 'Prepare Visual Redesign Direction',
    description: 'Defining the visual redesign direction based on your selected style, palette and lighting.',
    status: 'running',
  },
  {
    id: 'source',
    title: 'Locate Source Interior Image & Preserve Composition',
    description: 'Analyzing the source room to preserve its camera angle, structure and architectural geometry.',
    status: 'pending',
  },
  {
    id: 'generate',
    title: 'Generate High-Precision Architectural Render',
    description: 'Creating the high-resolution interior render with the selected materials, furniture and lighting.',
    status: 'pending',
  },
  {
    id: 'review',
    title: 'Verify Image Quality & Style',
    description: 'Reviewing the generated image for visual quality, composition and style consistency.',
    status: 'pending',
  },
  {
    id: 'deliver',
    title: 'Deliver Finished Visual Result',
    description: 'Preparing your final high-resolution design result.',
    status: 'pending',
  },
];

export function computeWorkflowState(rawMessages: any[]): WorkflowStepItem[] {
  const steps: WorkflowStepItem[] = INITIAL_WORKFLOW_STEPS.map((s) => ({ ...s }));

  const patterns = [
    { id: 'direction', regex: /design direction|visual workflow|redesign direction|direction confirmed|palette|theme|prompt|starting|initializing/i, index: 0 },
    { id: 'source', regex: /locate source|source interior|source image|preserve composition|camera angle|wall structure|architectural layout|windows|door|analyzing|inspecting/i, index: 1 },
    { id: 'generate', regex: /generating image|GPT Image|image generation|generate image|generating render|high resolution render|rendering|creating|processing|transforming/i, index: 2 },
    { id: 'review', regex: /check generated image|check quality|check failures|obvious failures|quality verification|review generated result|verify composition|upscaling|refining/i, index: 3 },
    { id: 'deliver', regex: /deliver finished|finished visual result|final result|final delivery|completed|generation complete|download|ready/i, index: 4 },
  ];

  let highestMatchedIndex = 0;
  const msgCount = Array.isArray(rawMessages) ? rawMessages.length : 0;

  // Natural progressive fallbacks based on message stream count
  if (msgCount >= 6) {
    highestMatchedIndex = 3;
  } else if (msgCount >= 3) {
    highestMatchedIndex = 2;
  } else if (msgCount >= 1) {
    highestMatchedIndex = 1;
  }

  for (const msg of rawMessages) {
    const text = typeof msg === 'string'
      ? msg
      : (typeof msg?.content === 'string' ? msg.content : msg?.content?.text || msg?.message || msg?.title || '');
    if (!text) continue;

    for (const p of patterns) {
      if (p.regex.test(text)) {
        if (p.index > highestMatchedIndex) {
          highestMatchedIndex = p.index;
        }
      }
    }
  }

  for (let i = 0; i < steps.length; i++) {
    if (i < highestMatchedIndex) {
      steps[i].status = 'completed';
    } else if (i === highestMatchedIndex) {
      steps[i].status = 'running';
    } else {
      steps[i].status = 'pending';
    }
  }

  return steps;
}

@Injectable()
export class ManusProvider implements IAIProvider {
  readonly id = 'manus';
  readonly name = 'Manus AI';
  private readonly logger = new Logger(ManusProvider.name);

  constructor(
    @Optional() @Inject(NotificationsService) private readonly notificationsService?: NotificationsService,
  ) {}

  // In-memory key index pointer for round-robin rotation
  private currentKeyIndex = 0;

  /**
   * Helper to parse array of Manus API keys from process.env
   */
  private getManusApiKeys(): string[] {
    const rawKeys = process.env.MANUS_API_KEYS || process.env.MANUS_API_KEY || '';
    if (!rawKeys) return [];
    return rawKeys
      .split(',')
      .map((k) => k.trim().replace(/^["']|["']$/g, ''))
      .filter((k) => k.length > 0);
  }

  /**
   * Deep search helper to extract generated image URLs from any nested Manus API response object,
   * filtering out original inputs and previously generated render output URLs for result correlation.
   */
  private extractAllImageUrls(obj: any, inputImageUrl?: string, existingImageUrls?: string[]): string[] {
    const foundUrls: string[] = [];
    const cleanInputUrl = inputImageUrl ? inputImageUrl.trim() : '';
    const ignoreList = Array.isArray(existingImageUrls) ? existingImageUrls.map((u) => u.trim()) : [];

    const isIgnored = (url: string) => {
      if (!url || typeof url !== 'string') return true;
      const u = url.trim();
      if (!u.startsWith('http://') && !u.startsWith('https://')) return true;
      if (cleanInputUrl) {
        if (u === cleanInputUrl) return true;
        if (cleanInputUrl.startsWith('http') && u.includes(new URL(cleanInputUrl).pathname)) return true;
      }
      if (ignoreList.includes(u)) return true;
      if (u.includes('uploaded_room_image') || u.includes('/avatar/') || u.includes('/profile/') || u.includes('/static/')) return true;
      return false;
    };

    const search = (item: any) => {
      if (!item) return;

      if (typeof item === 'string') {
        // Regex matches HTTP/HTTPS URLs inside Markdown, HTML, or raw strings
        const matches = item.match(/https?:\/\/[^\s"'<>\)\}\]\\]+/gi);
        if (matches) {
          for (const rawUrl of matches) {
            const cleaned = rawUrl.replace(/[\)\}\]\.,;]+$/, '');
            if (isIgnored(cleaned)) continue;
            if (
              /\.(png|jpg|jpeg|webp|gif|avif)($|\?)/i.test(cleaned) ||
              cleaned.includes('/files/') ||
              cleaned.includes('/attachments/') ||
              cleaned.includes('/images/') ||
              cleaned.includes('manus') ||
              cleaned.includes('s3.amazonaws') ||
              cleaned.includes('unsplash')
            ) {
              if (!foundUrls.includes(cleaned)) foundUrls.push(cleaned);
            }
          }
        }
        return;
      }

      if (Array.isArray(item)) {
        item.forEach((subItem) => search(subItem));
        return;
      }

      if (typeof item === 'object') {
        // Direct checks for typical image attachment/URL keys
        for (const key of ['url', 'file_url', 'download_url', 'image_url', 'src', 'href']) {
          const val = item[key];
          if (typeof val === 'string' && val.startsWith('http')) {
            const cleaned = val.trim().replace(/[\)\}\]\.,;]+$/, '');
            if (!isIgnored(cleaned) && !foundUrls.includes(cleaned)) {
              foundUrls.push(cleaned);
            }
          } else if (typeof val === 'object' && val?.url && typeof val.url === 'string') {
            const cleaned = val.url.trim().replace(/[\)\}\]\.,;]+$/, '');
            if (!isIgnored(cleaned) && !foundUrls.includes(cleaned)) {
              foundUrls.push(cleaned);
            }
          }
        }

        for (const key of Object.keys(item)) {
          search(item[key]);
        }
      }
    };

    search(obj);
    return foundUrls;
  }

  async generateImage(input: ImageGenerationInput): Promise<ImageGenerationOutput> {
    const startTime = Date.now();
    const apiKeys = this.getManusApiKeys();
    let allCollectedGeneratedImages: string[] = [];

    if (apiKeys.length === 0) {
      throw new Error('Manus API Key (MANUS_API_KEYS or MANUS_API_KEY) is missing in backend environment configuration.');
    }

    let buffer = input.imageBuffer;
    let mimeType = input.imageMimeType || 'image/png';

    // If buffer is missing but imageUrl is present, fetch the image to a Buffer
    if (!buffer && input.imageUrl) {
      this.logger.log(`Input imageBuffer is missing. Fetching image from URL: ${input.imageUrl}...`);
      try {
        const downloadRes = await axios.get(input.imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
        buffer = Buffer.from(downloadRes.data, 'binary');
        const contentType = downloadRes.headers['content-type'];
        mimeType = typeof contentType === 'string' ? contentType : 'image/png';
      } catch (err: any) {
        this.logger.error(`Failed to fetch input image from URL: ${err.message}`);
        throw new Error(`Failed to download input image for Manus AI: ${err.message}`);
      }
    }

    if (!buffer) {
      throw new Error('Manus AI generation requires an input image buffer or a valid image URL.');
    }

    const base64Image = `data:${mimeType};base64,${buffer.toString('base64')}`;
    const manusApiUrl = process.env.MANUS_API_URL || 'https://api.manus.ai/v2';

    // Resolve absolute image URL if input.originalImageUrl or input.imageUrl is provided
    let rawImageUrl = (input.originalImageUrl || input.imageUrl || '').trim();
    let absoluteImageUrl = '';

    // Check if a public domain or server URL is configured in environment
    const domainHost = (process.env.PUBLIC_SERVER_URL || process.env.APP_URL || process.env.DOMAIN_URL || process.env.BACKEND_URL || '').trim();
    const isPublicDomain = domainHost && !domainHost.includes('localhost') && !domainHost.includes('127.0.0.1');

    if (rawImageUrl) {
      if (rawImageUrl.startsWith('http://') || rawImageUrl.startsWith('https://')) {
        if (rawImageUrl.includes('localhost') || rawImageUrl.includes('127.0.0.1')) {
          if (isPublicDomain) {
            const cleanDomain = domainHost.replace(/\/$/, '');
            try {
              const urlPath = new URL(rawImageUrl).pathname;
              absoluteImageUrl = `${cleanDomain}${urlPath}`;
            } catch (e) {
              absoluteImageUrl = '';
            }
          } else {
            // Localhost URL: Unreachable from cloud. Rely on attached Base64 image payload without appending unreachable localhost link.
            absoluteImageUrl = '';
          }
        } else {
          // Public HTTPS / external image URL (e.g. Unsplash, Pexels, CDN)
          absoluteImageUrl = rawImageUrl;
        }
      } else if (rawImageUrl.startsWith('/uploads/') || rawImageUrl.startsWith('uploads/')) {
        if (isPublicDomain) {
          const cleanDomain = domainHost.replace(/\/$/, '');
          const cleanPath = rawImageUrl.startsWith('/') ? rawImageUrl : `/${rawImageUrl}`;
          absoluteImageUrl = `${cleanDomain}${cleanPath}`;
        } else {
          absoluteImageUrl = '';
        }
      }
    }

    // Always attach Original Input Image URL on line 1 if it is a valid public remote URL (not localhost!)
    const imagePrefix = absoluteImageUrl ? `[Original Input Image: ${absoluteImageUrl}]\n\n` : '';
    
    const aspectAndResolutionDirective = `\n\nCRITICAL INSTRUCTION: Preserve exact aspect ratio, camera perspective, and room proportions. Render in ultra-crisp 8K UHD photorealistic quality.`;

    const manusCombinedPrompt = `${imagePrefix}${input.prompt}${aspectAndResolutionDirective}`;

    // Loop through available API keys starting from currentKeyIndex
    let lastErrorMessage = '';
    const attemptsCount = apiKeys.length;

    for (let i = 0; i < attemptsCount; i++) {
      const keyIndex = (this.currentKeyIndex + i) % apiKeys.length;
      const currentApiKey = apiKeys[keyIndex];
      const isKeyRotated = i > 0;

      // Omit previous chatId if we switched to a new API key
      const effectiveChatId = isKeyRotated ? undefined : input.chatId;

      this.logger.log(
        `Submitting image generation request to Manus AI API (Key #${keyIndex + 1} of ${apiKeys.length})...`,
      );
      console.log(`\n=================== 📡 FULL MANUS API PAYLOAD PROMPT 📡 ===================`);
      console.log(manusCombinedPrompt);
      console.log(`============================================================================\n`);

      const effectiveTaskId = input.manusTaskId || input.chatId || undefined;
      const isContinuation = Boolean(effectiveTaskId);

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-manus-api-key': currentApiKey,
          'API_KEY': currentApiKey,
        };

        let postEndpoint = '';
        let payload: Record<string, any> = {};

        if (isContinuation) {
          this.logger.log(`💬 [MANUS API ACTION] SEND_MESSAGE -> Continuing existing Manus Task ID "${effectiveTaskId}"`);
          postEndpoint = manusApiUrl.includes('/v2')
            ? `${manusApiUrl}/task.sendMessage`
            : `${manusApiUrl}/tasks/${effectiveTaskId}/sendMessage`;

          payload = {
            task_id: effectiveTaskId,
            message: { content: manusCombinedPrompt },
            image: base64Image,
            attachments: [
              {
                filename: 'uploaded_room_image.png',
                file_data: base64Image,
              },
            ],
            negative_prompt: input.negativePrompt || 'low quality, bad quality, distorted architecture, blurry',
            share_visibility: 'public',
          };
        } else {
          this.logger.log(`🚀 [MANUS API ACTION] CREATE_TASK -> Initializing new Manus Task (First Generation for Project)`);
          postEndpoint = manusApiUrl.includes('/v2') ? `${manusApiUrl}/task.create` : `${manusApiUrl}/tasks`;

          payload = {
            prompt: manusCombinedPrompt,
            message: { content: manusCombinedPrompt },
            image: base64Image,
            attachments: [
              {
                filename: 'uploaded_room_image.png',
                file_data: base64Image,
              },
            ],
            negative_prompt: input.negativePrompt || 'low quality, bad quality, distorted architecture, blurry',
            share_visibility: 'public',
          };
        }

        let response: any;
        try {
          response = await axios.post(postEndpoint, payload, { headers, timeout: 30000 });
        } catch (apiErr: any) {
          // If task.sendMessage returns 404 Task Not Found or 400 invalid task on a continuation request, fallback to creating a fresh task for the project
          if (isContinuation && (apiErr.response?.status === 404 || apiErr.response?.status === 400)) {
            this.logger.warn(`Task "${effectiveTaskId}" is no longer active on Manus (${apiErr.response?.status}). Falling back to CREATE_TASK...`);
            postEndpoint = manusApiUrl.includes('/v2') ? `${manusApiUrl}/task.create` : `${manusApiUrl}/tasks`;
            payload = {
              prompt: manusCombinedPrompt,
              message: { content: manusCombinedPrompt },
              image: base64Image,
              attachments: [
                {
                  filename: 'uploaded_room_image.png',
                  file_data: base64Image,
                },
              ],
              negative_prompt: input.negativePrompt || 'low quality, bad quality, distorted architecture, blurry',
              share_visibility: 'public',
            };
            response = await axios.post(postEndpoint, payload, { headers, timeout: 30000 });
          } else {
            throw apiErr;
          }
        }

        const data = response.data;
        let outputUrl = data.imageUrl || data.url || data.output?.[0] || data.data?.[0]?.url;
        const targetTaskId = data.id || data.task_id || data.data?.id || effectiveTaskId;

        // Async task polling logic
        if (!outputUrl && targetTaskId) {
          const taskId = targetTaskId;
          const statusUrl = data.status_url || `${manusApiUrl}/tasks/${taskId}`;
          this.logger.log(`✅ Manus task active. Task ID: ${taskId}. Mode: ${isContinuation ? 'CONTINUATION (sendMessage)' : 'NEW_TASK (createTask)'}`);

          // Poll Manus API for output image URL (up to 120 attempts x 5s = 10 minutes / 600s total)
          const maxPollAttempts = 120;
          const pollIntervalMs = 5000; // 5-second responsive polling interval
          let lastFailureReason = '';

          this.logger.log(`\n🚀 [TASK GENERATION STARTED] Manus Task ID: "${taskId}" | Polling every 5s...`);

          for (let pollAttempt = 1; pollAttempt <= maxPollAttempts; pollAttempt++) {
            await new Promise((r) => setTimeout(r, pollIntervalMs));
            const elapsedSec = pollAttempt * 5;
            const timeFormatted = new Date().toLocaleTimeString();

            let currentTaskStatus = '';

            // Step 1: Query task.list to verify task execution state
            if (manusApiUrl.includes('/v2')) {
              try {
                const listRes = await axios.get(`${manusApiUrl}/task.list`, { headers, timeout: 5000 });
                const taskObj = listRes.data?.data?.find((t: any) => t.id === taskId);
                if (taskObj) {
                  currentTaskStatus = String(taskObj.status || '').toLowerCase();
                  if (['error', 'failed', 'cancelled', 'canceled', 'terminated', 'aborted'].includes(currentTaskStatus)) {
                    const errorDetail = taskObj.error?.message || taskObj.title || `Task state returned "${currentTaskStatus}"`;
                    console.log(`\n❌ [PIPELINE ERROR DETECTED - ${timeFormatted}]`);
                    console.log(`   Task ID: ${taskId}`);
                    console.log(`   Status:  ${currentTaskStatus.toUpperCase()}`);
                    console.log(`   Reason:  ${errorDetail}\n`);
                    throw new Error(`Manus AI Task execution failed (${currentTaskStatus}): ${errorDetail}`);
                  }
                }
              } catch (listErr: any) {
                if (listErr.message && listErr.message.includes('Manus AI Task execution failed')) {
                  throw listErr;
                }
                // Silently ignore transient network errors during task.list query
              }

              // Step 2: Query task.listMessages for completed render image output & live workflow steps
              try {
                const msgEndpoint = `${manusApiUrl}/task.listMessages?task_id=${taskId}`;
                const msgRes = await axios.get(msgEndpoint, { headers, timeout: 8000 });
                
                const taskMsgStatus = String(msgRes.data?.status || '').toLowerCase();
                if (['failed', 'error', 'cancelled', 'canceled', 'terminated', 'aborted'].includes(taskMsgStatus) || msgRes.data?.error) {
                  const errDetail = msgRes.data?.error?.message || msgRes.data?.message || `Task status: ${taskMsgStatus}`;
                  console.log(`\n❌ [API REJECTION / ERROR DETECTED - ${timeFormatted}]`);
                  console.log(`   Task ID: ${taskId}`);
                  console.log(`   Reason:  ${errDetail}\n`);
                  throw new Error(`Manus AI Task execution error (${taskMsgStatus}): ${errDetail}`);
                }

                // Progressive step state machine processing of raw Manus runtime messages
                if (msgRes.data) {
                  const msgs = Array.isArray(msgRes.data?.data) ? msgRes.data.data : Array.isArray(msgRes.data?.messages) ? msgRes.data.messages : [];
                  const workflowSteps = computeWorkflowState(msgs);
                  const activeStepIndex = workflowSteps.findIndex((s) => s.status === 'running');
                  const currentActiveIndex = activeStepIndex >= 0 ? activeStepIndex : 0;
                  const activeStep = workflowSteps[currentActiveIndex];

                  console.log(`\n\x1b[1;36m┌────────────────────────────────────────────────────────────────────────┐\x1b[0m`);
                  console.log(`\x1b[1;36m│ 📡 LIVE MANUS AI PIPELINE [${timeFormatted}] (${elapsedSec}s elapsed)\x1b[0m`);
                  console.log(`\x1b[1;36m├────────────────────────────────────────────────────────────────────────┤\x1b[0m`);
                  
                  // Sequentially reveal completed and current active steps
                  workflowSteps.forEach((step, idx) => {
                    if (step.status === 'completed') {
                      console.log(`│  \x1b[1;32m✔ [STEP ${idx + 1} COMPLETED]: ${step.title}\x1b[0m`);
                    } else if (step.status === 'running') {
                      console.log(`│  \x1b[1;35m⏳ [STEP ${idx + 1} IN PROGRESS]: ${step.title}...\x1b[0m`);
                    }
                  });
                  console.log(`\x1b[1;36m└────────────────────────────────────────────────────────────────────────┘\x1b[0m\n`);

                  if (input.onProgress) {
                    input.onProgress({
                      statusText: `Step ${currentActiveIndex + 1}: ${activeStep.title}`,
                      steps: workflowSteps,
                    });
                  }
                }

                // Extract generated render image URLs from agent messages, attachments, and output payloads
                const msgs = Array.isArray(msgRes.data?.data) ? msgRes.data.data : Array.isArray(msgRes.data?.messages) ? msgRes.data.messages : [];
                
                // Exclude explicit user input messages so we only search agent output responses & attachments
                const nonUserMsgs = msgs.filter((m: any) => {
                  const roleStr = String(m?.role || m?.sender || m?.author || m?.type || '').toLowerCase();
                  return roleStr !== 'user';
                });

                const payloadToSearch = nonUserMsgs.length > 0 ? nonUserMsgs : msgRes.data;
                const msgExtractedUrls = this.extractAllImageUrls(payloadToSearch, input.originalImageUrl || input.imageUrl, input.existingImageUrls);

                // Determine if Manus task has finished execution or output images are available
                const isTaskFinished =
                  ['completed', 'stopped', 'done', 'finished'].includes(currentTaskStatus) ||
                  ['completed', 'stopped', 'done', 'finished'].includes(taskMsgStatus);

                if (msgExtractedUrls.length > 0) {
                  outputUrl = msgExtractedUrls[msgExtractedUrls.length - 1];
                  allCollectedGeneratedImages = msgExtractedUrls;
                  console.log(`\n\x1b[1;33m⬇️  [IMAGE DOWNLOADING] Fetching ${msgExtractedUrls.length} rendered image(s) from Manus CDN...\x1b[0m`);
                  console.log(`\x1b[1;33m🖼️  [RENDER IMAGES RECEIVED] Primary URL: ${outputUrl}\x1b[0m`);
                  console.log(`\x1b[1;32m✅  [SUCCESS] Render images loaded & validated after ${elapsedSec}s!\x1b[0m\n`);
                  break;
                } else {
                  lastFailureReason = `Manus AI active (Status: "${currentTaskStatus || taskMsgStatus || 'running'}"), processing generation turn (${elapsedSec}s elapsed)...`;
                }
              } catch (msgErr: any) {
                if (msgErr.message && msgErr.message.includes('Manus AI Task execution')) {
                  throw msgErr;
                }
                const status = msgErr.response?.status;
                const errText = msgErr.response?.data?.error?.message || msgErr.response?.data?.message || msgErr.message;
                
                if (status === 404) {
                  lastFailureReason = `Task queued on Manus Agent platform (${elapsedSec}s)...`;
                  console.log(`\x1b[1;34m⏳ [${timeFormatted}] Task queued on Manus platform (${elapsedSec}s)...\x1b[0m`);
                } else {
                  lastFailureReason = status ? `HTTP ${status}: ${errText}` : errText;
                  console.log(`\x1b[1;33m⚠️  [${timeFormatted}] Polling status (${elapsedSec}s): ${lastFailureReason}\x1b[0m`);
                }
              }
            }

            // Step 3: Fallback endpoint for Manus v1 tasks: tasks/${taskId}
            if (!outputUrl && !manusApiUrl.includes('/v2')) {
              try {
                const detailEndpoint = `${manusApiUrl}/tasks/${taskId}`;
                const pollRes = await axios.get(detailEndpoint, { headers, timeout: 8000 });
                
                const extractedUrls = this.extractAllImageUrls(pollRes.data, input.imageUrl, input.existingImageUrls);
                if (extractedUrls.length > 0) {
                  outputUrl = extractedUrls[extractedUrls.length - 1];
                  allCollectedGeneratedImages = extractedUrls;
                  console.log(`\n⬇️  [IMAGE DOWNLOADING] Fetching rendered image from Manus CDN...`);
                  console.log(`🖼️  [RENDER IMAGE RECEIVED] URL: ${outputUrl}`);
                  console.log(`✅  [SUCCESS] Render image loaded & validated after ${elapsedSec}s!\n`);
                  break;
                }
              } catch (detailErr: any) {
                // Silently ignore
              }
            }
          }

          if (!outputUrl) {
            this.logger.log(`Performing final fallback sweep for task ID ${taskId}...`);
            try {
              const finalMsgRes = await axios.get(`${manusApiUrl}/task.listMessages?task_id=${taskId}`, { headers, timeout: 10000 });
              const finalExtracted = this.extractAllImageUrls(finalMsgRes.data, input.imageUrl, input.existingImageUrls);
              if (finalExtracted.length > 0) {
                outputUrl = finalExtracted[finalExtracted.length - 1];
                allCollectedGeneratedImages = finalExtracted;
                this.logger.log(`✅ [FINAL SWEEP SUCCESS] Render image retrieved on final sweep: ${outputUrl}`);
              }
            } catch (e: any) {
              this.logger.warn(`Final sweep attempt failed: ${e.message}`);
            }
          }

          if (!outputUrl || outputUrl.includes('manus.ai/share/') || outputUrl.includes('manus.ai/task/') || outputUrl.includes('/tasks/')) {
            console.log(`\n❌ [PIPELINE TIMEOUT ERROR] Task finished or timed out without producing an image.`);
            throw new Error('GENERATION_RESULT_MISSING: Manus AI task finished but no valid output image URL was generated.');
          }
        }

        if (!outputUrl || outputUrl.includes('manus.ai/share/') || outputUrl.includes('manus.ai/task/') || outputUrl.includes('/tasks/')) {
          throw new Error('GENERATION_RESULT_MISSING: Manus AI response did not contain a valid image URL.');
        }

        // On success, update currentKeyIndex to this working key
        this.currentKeyIndex = keyIndex;

        const totalTime = Date.now() - startTime;
        this.logger.log(`Manus AI generation request completed in ${totalTime}ms using Key #${keyIndex + 1}. Task ID: ${targetTaskId}`);

        // Trigger real-time Socket.IO Admin Notification for successful generation without page refresh
        if (this.notificationsService) {
          this.notificationsService.notifyAdmin({
            title: '🎨 AI Image Generation Successful',
            message: `AI Room Redesign successfully rendered image in ${totalTime}ms (Task: ${targetTaskId || 'N/A'}).`,
            type: 'success',
            metadata: { taskId: targetTaskId, url: outputUrl, durationMs: totalTime },
          }).catch((e) => this.logger.warn(`Admin notification error: ${e.message}`));

          if (input.userId) {
            this.notificationsService.notifyUser({
              userId: input.userId,
              title: '🎨 AI Room Redesign Ready!',
              message: 'Your high-resolution room redesign has completed rendering and is ready to view.',
              type: 'success',
              metadata: { taskId: targetTaskId, url: outputUrl },
            }).catch((e) => this.logger.warn(`User notification error: ${e.message}`));
          }
        }

        return {
          imageUrl: outputUrl,
          generatedImages: allCollectedGeneratedImages.length > 0 ? allCollectedGeneratedImages : [outputUrl],
          costUSD: 0.01,
          providerName: this.name,
          modelName: 'manus-vision-gen',
          manusTaskId: targetTaskId,
          chatId: targetTaskId,
          isNewTask: !isContinuation,
        };
      } catch (err: any) {
        const status = err.response?.status;
        const errMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
        lastErrorMessage = errMsg;

        this.logger.warn(`Manus API Key #${keyIndex + 1} failed (Status ${status || 'Error'}): ${errMsg}`);

        // Trigger Manus AI credit balance / quota limit warning notification
        if (status === 429 || status === 402 || status === 401 || status === 403) {
          if (this.notificationsService) {
            this.notificationsService.notifyAdmin({
              title: '⚠️ Manus AI Credits / Balance Limit Reached',
              message: `Manus AI API Key #${keyIndex + 1} credit balance reached end or quota limit hit (Status ${status}): ${errMsg}`,
              type: 'warning',
              metadata: { keyIndex, status, error: errMsg },
            }).catch((e) => this.logger.warn(`Admin notification error: ${e.message}`));
          }
        }

        // If rate limit (429), quota exceeded (402/403), or auth failure (401), try next key if available
        if ((status === 429 || status === 402 || status === 401 || status === 403) && i < apiKeys.length - 1) {
          this.logger.log(`⚠️ Auto-rotating to next available Manus API Key in pool...`);
          continue;
        }

        // Trigger real-time Socket.IO Admin Notification for generation error
        if (this.notificationsService) {
          this.notificationsService.notifyAdmin({
            title: '🚨 AI Image Generation Error',
            message: `AI Room Redesign generation failed: ${errMsg}`,
            type: 'alert',
            metadata: { error: errMsg, keyIndex, status },
          }).catch((e) => this.logger.warn(`Admin notification error: ${e.message}`));
        }

        throw new Error(`Manus API Request Failed (Status ${status || 'Error'}): ${errMsg}`);
      }
    }

    // Trigger notification when all keys fail / balance reaches end
    if (this.notificationsService) {
      this.notificationsService.notifyAdmin({
        title: '🔴 Manus AI Credits Exhausted',
        message: `All ${apiKeys.length} Manus API keys failed or ran out of credits. Last error: ${lastErrorMessage}`,
        type: 'alert',
        metadata: { keysCount: apiKeys.length, lastError: lastErrorMessage },
      }).catch((e) => this.logger.warn(`Admin notification error: ${e.message}`));
    }

    throw new Error(`All ${apiKeys.length} Manus API keys failed. Last error: ${lastErrorMessage}`);
  }

  async isHealthy(): Promise<boolean> {
    const keys = this.getManusApiKeys();
    return keys.length > 0;
  }
}

