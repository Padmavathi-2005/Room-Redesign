import { Injectable, Logger } from '@nestjs/common';
import { IAIProvider, ImageGenerationInput, ImageGenerationOutput, WorkflowStepItem } from '../../../common/interfaces/ai-provider.interface';
import axios from 'axios';

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
    { id: 'direction', regex: /design direction|visual workflow|redesign direction|direction confirmed|palette confirmed|theme confirmed/i, index: 0 },
    { id: 'source', regex: /locate source|source interior|source image|preserve composition|camera angle|wall structure|architectural layout|windows|door placement/i, index: 1 },
    { id: 'generate', regex: /generating image|GPT Image|image generation|generate image|generating render|high resolution render/i, index: 2 },
    { id: 'review', regex: /check generated image|check quality|check failures|obvious failures|quality verification|review generated result|verify composition/i, index: 3 },
    { id: 'deliver', regex: /deliver finished|finished visual result|final result|final delivery|completed|generation complete/i, index: 4 },
  ];

  let highestMatchedIndex = 0;

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
   * Deep search helper to extract generated image URLs from any nested Manus API response object
   */
  private extractAllImageUrls(obj: any, inputImageUrl?: string): string[] {
    const foundUrls: string[] = [];
    const cleanInputUrl = inputImageUrl ? inputImageUrl.trim() : '';

    const search = (item: any) => {
      if (!item) return;
      if (typeof item === 'string') {
        const matches = item.match(/https?:\/\/[^"\s\)\}\],]+\.(png|jpg|jpeg|webp|gif)(\?[^"\s\)\}\],]+)?/gi);
        if (matches) {
          for (const url of matches) {
            if (cleanInputUrl && url === cleanInputUrl) continue;
            if (!foundUrls.includes(url)) foundUrls.push(url);
          }
        }
        return;
      }
      if (Array.isArray(item)) {
        item.forEach((subItem) => search(subItem));
        return;
      }
      if (typeof item === 'object') {
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

    // Resolve absolute image URL if input.imageUrl is provided
    let absoluteImageUrl = input.imageUrl || '';
    if (absoluteImageUrl && !absoluteImageUrl.startsWith('http://') && !absoluteImageUrl.startsWith('https://') && !absoluteImageUrl.startsWith('data:')) {
      const host = process.env.BACKEND_URL || 'http://localhost:5001';
      const cleanHost = host.endsWith('/') ? host.slice(0, -1) : host;
      const cleanPath = absoluteImageUrl.startsWith('/') ? absoluteImageUrl : `/${absoluteImageUrl}`;
      absoluteImageUrl = `${cleanHost}${cleanPath}`;
    }

    // Determine if absoluteImageUrl is a publicly accessible internet URL (non-localhost)
    const isPublicUrl = absoluteImageUrl &&
      (absoluteImageUrl.startsWith('http://') || absoluteImageUrl.startsWith('https://')) &&
      !absoluteImageUrl.includes('localhost') &&
      !absoluteImageUrl.includes('127.0.0.1');

    // Attach public URL to prompt if accessible over internet, otherwise transmit image buffer directly
    const imagePrefix = isPublicUrl ? `Reference Input Room Image URL: ${absoluteImageUrl}\n\n` : '';
    
    const aspectAndResolutionDirective = `\n\nCRITICAL RESOLUTION & GEOMETRIC PROPORTION INSTRUCTIONS:
1. PRESERVE ORIGINAL ASPECT RATIO: Maintain the exact geometric aspect ratio, camera perspective, and room shape of the reference input image. Do not warp, stretch, or alter the natural room proportions.
2. HIGH PIXEL UPSCALE & CLARITY ENHANCEMENT: If the uploaded input image is low-resolution or blurry (e.g. 300x300), upscale and render the output image into ultra-crisp, high-resolution architectural quality (minimum 4K/8K UHD, e.g., 1024x1024 / 2048x2048 or higher equivalent matching the exact aspect ratio). Enhance all room textures, lighting, and materials into razor-sharp, photorealistic clarity.`;

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

      try {
        const payload: Record<string, any> = {
          prompt: manusCombinedPrompt,
          message: {
            content: manusCombinedPrompt,
          },
          image: base64Image,
          attachments: [
            {
              filename: 'uploaded_room_image.png',
              file_data: base64Image,
            },
          ],
          negative_prompt: input.negativePrompt || 'low quality, bad quality, distorted architecture, blurry',
          options: input.options || {},
        };

        if (effectiveChatId) {
          payload.chat_id = effectiveChatId;
          payload.session_id = effectiveChatId;
          payload.parent_task_id = effectiveChatId;
        }

        // Add message.content and share_visibility required by Manus AI v2 task.create spec
        payload.message = { content: manusCombinedPrompt };
        payload.share_visibility = 'public';

        // Headers: strictly use x-manus-api-key & API_KEY (Omit Authorization: Bearer which triggers JWT malformed error on API keys)
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-manus-api-key': currentApiKey,
          'API_KEY': currentApiKey,
        };

        const postEndpoint = manusApiUrl.includes('/v2') ? `${manusApiUrl}/task.create` : `${manusApiUrl}/tasks`;
        const response = await axios.post(postEndpoint, payload, {
          headers,
          timeout: 30000,
        });

        const data = response.data;
        let outputUrl = data.imageUrl || data.url || data.output?.[0] || data.data?.[0]?.url;
        const returnedChatId = data.chat_id || data.session_id || data.conversation_id || data.id || data.task_id || effectiveChatId;

        // Async task polling logic
        if (!outputUrl && (data.id || data.task_id)) {
          const taskId = data.id || data.task_id;
          const statusUrl = data.status_url || `${manusApiUrl}/tasks/${taskId}`;
          this.logger.log(`✅ Manus task created successfully. Task ID: ${taskId}. App URL: ${data.task_url || statusUrl}`);

          // Poll Manus API for output image URL (up to 60 attempts x 10s = 10 minutes / 600s total)
          const maxPollAttempts = 60;
          const pollIntervalMs = 10000;
          let lastFailureReason = '';

          for (let pollAttempt = 1; pollAttempt <= maxPollAttempts; pollAttempt++) {
            await new Promise((r) => setTimeout(r, pollIntervalMs));
            const elapsedSec = pollAttempt * 10;
            this.logger.log(`Polling Manus API task #${taskId} (Attempt ${pollAttempt}/${maxPollAttempts} - ${elapsedSec}s elapsed)...`);

            // Step 1: Query task.list to verify task execution state
            if (manusApiUrl.includes('/v2')) {
              try {
                const listRes = await axios.get(`${manusApiUrl}/task.list`, { headers, timeout: 5000 });
                const taskObj = listRes.data?.data?.find((t: any) => t.id === taskId);
                if (taskObj) {
                  this.logger.log(`Task #${taskId} state in task.list: "${taskObj.status}"`);
                  if (taskObj.status === 'error' || taskObj.status === 'failed') {
                    throw new Error(`Manus API Task execution failed: ${taskObj.title || 'Task error'}`);
                  }
                }
              } catch (listErr: any) {
                // Silently ignore task.list transient errors
              }

              // Step 2: Query task.listMessages for completed render image output
              try {
                const msgEndpoint = `${manusApiUrl}/task.listMessages?task_id=${taskId}`;
                const msgRes = await axios.get(msgEndpoint, { headers, timeout: 8000 });
                
                if (msgRes.data?.status === 'failed' || msgRes.data?.error) {
                  const errDetail = msgRes.data?.error?.message || msgRes.data?.message || 'Task processing error';
                  throw new Error(`Manus API Task execution failed: ${errDetail}`);
                }

                // Safe state machine processing of raw Manus runtime messages
                if (msgRes.data) {
                  const msgs = Array.isArray(msgRes.data?.data) ? msgRes.data.data : Array.isArray(msgRes.data?.messages) ? msgRes.data.messages : [];
                  const workflowSteps = computeWorkflowState(msgs);
                  const activeStep = workflowSteps.find((s) => s.status === 'running') || workflowSteps[0];

                  console.log(`\n================ 🤖 MANUS WORKFLOW STATE MACHINE (${elapsedSec}s) ================`);
                  workflowSteps.forEach((step, idx) => {
                    const icon = step.status === 'completed' ? '✓' : step.status === 'running' ? '◉' : '○';
                    console.log(`   ${icon} Step ${idx + 1} [${step.status.toUpperCase()}]: ${step.title}`);
                  });
                  console.log(`========================================================================\n`);

                  if (input.onProgress) {
                    input.onProgress({
                      statusText: `Step ${workflowSteps.findIndex((s) => s.status === 'running') + 1}: ${activeStep.title}`,
                      steps: workflowSteps,
                    });
                  }
                }

                const msgExtractedUrls = this.extractAllImageUrls(msgRes.data, input.imageUrl);
                if (msgExtractedUrls.length > 0) {
                  outputUrl = msgExtractedUrls[0];
                  allCollectedGeneratedImages = msgExtractedUrls;
                  this.logger.log(`🎉 Retrieved generated image URL from task.listMessages on attempt ${pollAttempt} (${elapsedSec}s): ${outputUrl}`);
                  break;
                } else {
                  lastFailureReason = `Task active (HTTP ${msgRes.status}), waiting for render output image...`;
                }
              } catch (msgErr: any) {
                const status = msgErr.response?.status;
                const errText = msgErr.response?.data?.error?.message || msgErr.response?.data?.message || msgErr.message;
                
                if (status === 404) {
                  lastFailureReason = `Task queued on Manus Agent platform (${elapsedSec}s)...`;
                  this.logger.debug(`Attempt ${pollAttempt} (${elapsedSec}s): Task queued on Manus platform...`);
                } else {
                  lastFailureReason = status ? `HTTP ${status}: ${errText}` : errText;
                  this.logger.warn(`listMessages attempt ${pollAttempt} status: ${lastFailureReason}`);
                }
              }
            }

            // Step 3: Fallback endpoint for Manus v1 tasks: tasks/${taskId}
            if (!outputUrl && !manusApiUrl.includes('/v2')) {
              try {
                const detailEndpoint = `${manusApiUrl}/tasks/${taskId}`;
                const pollRes = await axios.get(detailEndpoint, { headers, timeout: 8000 });
                
                const extractedUrls = this.extractAllImageUrls(pollRes.data, input.imageUrl);
                if (extractedUrls.length > 0) {
                  outputUrl = extractedUrls[0];
                  allCollectedGeneratedImages = extractedUrls;
                  this.logger.log(`🎉 Retrieved generated image URL from tasks endpoint on attempt ${pollAttempt} (${elapsedSec}s): ${outputUrl}`);
                  break;
                }
              } catch (detailErr: any) {
                // Silently ignore
              }
            }
          }

          if (!outputUrl) {
            outputUrl = data.share_url || data.task_url || statusUrl;
            this.logger.log(`ℹ️ Task #${taskId} created and running on Manus platform: ${outputUrl}`);
          }
        }

        if (!outputUrl) {
          throw new Error('Manus AI response did not contain a valid image URL or task ID.');
        }

        // On success, update currentKeyIndex to this working key
        this.currentKeyIndex = keyIndex;

        const totalTime = Date.now() - startTime;
        this.logger.log(`Manus AI generation request completed in ${totalTime}ms using Key #${keyIndex + 1}. Session ID: ${returnedChatId}`);

        return {
          imageUrl: outputUrl,
          generatedImages: allCollectedGeneratedImages.length > 0 ? allCollectedGeneratedImages : [outputUrl],
          costUSD: 0.01,
          providerName: this.name,
          modelName: 'manus-vision-gen',
          chatId: returnedChatId,
        };
      } catch (err: any) {
        const status = err.response?.status;
        const errMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
        lastErrorMessage = errMsg;

        this.logger.warn(`Manus API Key #${keyIndex + 1} failed (Status ${status || 'Error'}): ${errMsg}`);

        // If rate limit (429), quota exceeded (402/403), or auth failure (401), try next key if available
        if ((status === 429 || status === 402 || status === 401 || status === 403) && i < apiKeys.length - 1) {
          this.logger.log(`⚠️ Auto-rotating to next available Manus API Key in pool...`);
          continue;
        }

        throw new Error(`Manus API Request Failed (Status ${status || 'Error'}): ${errMsg}`);
      }
    }

    throw new Error(`All ${apiKeys.length} Manus API keys failed. Last error: ${lastErrorMessage}`);
  }

  async isHealthy(): Promise<boolean> {
    const keys = this.getManusApiKeys();
    return keys.length > 0;
  }
}

