import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

export interface ProgressState {
  step: string;
  message: string;
  percentage: number;
  data?: any;
}

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);
  
  // In-memory registry of active jobs and their progress streams
  private readonly jobs = new Map<string, Subject<ProgressState>>();

  /**
   * Register a job and return its progress Subject
   */
  public registerJob(jobId: string): Subject<ProgressState> {
    const subject = new Subject<ProgressState>();
    this.jobs.set(jobId, subject);
    return subject;
  }

  /**
   * Get progress Subject for a job
   */
  public getJobProgress(jobId: string): Subject<ProgressState> | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Delete job from memory after completion
   */
  public deregisterJob(jobId: string) {
    this.jobs.delete(jobId);
  }

  /**
   * Main redesign execution method supporting Manus API
   */
  public async executeRedesign(
    jobId: string,
    imageUrl: string,
    styleUrl: string | undefined,
    prompt: string,
    apiProvider: 'manus' | 'openai' = 'manus',
    model: string = 'manus-v2',
    userApiKey?: string,
  ) {
    const subject = this.jobs.get(jobId);
    if (!subject) return;

    this.logger.log(`[JOB ${jobId}] Starting Manus AI redesign pipeline (Model: ${model})...`);
    
    // Ensure outputs directory exists
    const publicDir = path.join(process.cwd(), 'public');
    const outputsDir = path.join(publicDir, 'outputs');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

    await this.runManusPipeline(jobId, subject, imageUrl, prompt, userApiKey);
  }

  /**
   * Pipeline integrating Manus API with uploaded image and prompt
   */
  private async runManusPipeline(
    jobId: string,
    subject: Subject<ProgressState>,
    imageUrl: string,
    prompt: string,
    userApiKey?: string,
  ) {
    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    try {
      subject.next({
        step: 'fetching_images',
        message: 'Fetching uploaded image and initializing Manus AI task...',
        percentage: 15,
      });

      const apiKey = (userApiKey || process.env.MANUS_API_KEY || '').trim();
      let outputBuffer: Buffer | null = null;
      const manusPrompt = `${imageUrl} ${prompt}`;

      if (!apiKey) {
        throw new Error('MANUS_API_KEY is not defined in server configuration. Please check your credentials.');
      }

      this.logger.log(`[JOB ${jobId}] Dispatching uploaded room image & prompt to Manus API...`);
      subject.next({
        step: 'connecting_manus',
        message: 'Connecting to Manus AI API server...',
        percentage: 40,
      });

      // Submit task to Manus API endpoint with simple space-separated image URL + prompt format
      const manusResponse = await axios.post(
        'https://api.manus.ai/v2/task.create',
        {
          prompt: manusPrompt,
          message: {
            content: manusPrompt,
            attachments: [{ type: 'image', url: imageUrl }],
          },
          attachments: [{ url: imageUrl }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-manus-api-key': apiKey,
            'API_KEY': apiKey,
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 30000,
        },
      );

      const taskData = manusResponse.data;
      const taskId = taskData?.task_id || taskData?.id || taskData?.data?.id;

      const extractImageUrl = (obj: any): string | null => {
        if (!obj) return null;
        if (typeof obj.output === 'string' && obj.output.startsWith('http')) return obj.output;
        if (obj.output?.image_url) return obj.output.image_url;
        if (obj.data?.output?.image_url) return obj.data.output.image_url;
        if (obj.result?.url) return obj.result.url;
        if (Array.isArray(obj.files) && obj.files[0]?.url) return obj.files[0].url;
        if (Array.isArray(obj.data?.files) && obj.data.files[0]?.url) return obj.data.files[0].url;
        if (Array.isArray(obj.output) && obj.output[0]?.url) return obj.output[0].url;
        if (typeof obj.image_url === 'string') return obj.image_url;
        if (typeof obj.data?.image_url === 'string') return obj.data.image_url;
        
        const str = JSON.stringify(obj);
        const match = str.match(/https:\/\/[^"\s]+\.(png|jpg|jpeg|webp)(\?[^"\s]+)?/i);
        return match ? match[0] : null;
      };

      if (taskId) {
        this.logger.log(`[JOB ${jobId}] Manus task created successfully (Task ID: ${taskId}). Monitoring progress...`);
        subject.next({
          step: 'processing_manus',
          message: `Manus AI processing room redesign (${taskId})...`,
          percentage: 40,
        });

        // Poll task status endpoint (Manus v2 API: /v2/task.detail?task_id=...)
        // Wait up to 240 attempts * 5 seconds = 20 minutes for Manus Agent to finish generating images
        let outputImageUrl: string | null = null;
        for (let attempt = 0; attempt < 240; attempt++) {
          await sleep(5000);
          const elapsed = (attempt + 1) * 5;
          const pct = Math.min(95, 40 + Math.floor((attempt / 240) * 55));

          subject.next({
            step: 'processing_manus',
            message: `Manus AI Agent analyzing space and rendering redesign... (${elapsed}s elapsed)`,
            percentage: pct,
          });

          try {
            let statusRes;
            try {
              statusRes = await axios.get(`https://api.manus.ai/v2/task.detail?task_id=${taskId}`, {
                headers: {
                  'x-manus-api-key': apiKey,
                  'API_KEY': apiKey,
                  Authorization: `Bearer ${apiKey}`,
                },
                timeout: 20000,
              });
            } catch (e1) {
              statusRes = await axios.get(`https://api.manus.ai/v1/tasks/${taskId}`, {
                headers: {
                  'x-manus-api-key': apiKey,
                  'API_KEY': apiKey,
                  Authorization: `Bearer ${apiKey}`,
                },
                timeout: 20000,
              });
            }

            const sData = statusRes.data;
            const statusStr = (sData?.status || sData?.data?.status || '').toLowerCase();

            outputImageUrl = extractImageUrl(sData);

            // If status is completed/stopped/done or image found in messages, check listMessages endpoint as well
            if (!outputImageUrl && (statusStr === 'completed' || statusStr === 'stopped' || statusStr === 'done' || (attempt > 0 && attempt % 3 === 0))) {
              try {
                const msgRes = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`, {
                  headers: {
                    'x-manus-api-key': apiKey,
                    'API_KEY': apiKey,
                    Authorization: `Bearer ${apiKey}`,
                  },
                  timeout: 15000,
                });
                outputImageUrl = extractImageUrl(msgRes.data);
              } catch (msgErr) {
                // Ignore message list error
              }
            }

            if (outputImageUrl || statusStr === 'completed' || statusStr === 'stopped' || statusStr === 'done') {
              if (outputImageUrl) {
                this.logger.log(`[JOB ${jobId}] Manus returned generated redesign image: ${outputImageUrl}`);
                break;
              }
            }
          } catch (pollErr: any) {
            this.logger.warn(`Polling Manus task attempt ${attempt + 1} (${elapsed}s): ${pollErr.message}`);
          }
        }

        if (outputImageUrl) {
          const imgRes = await axios.get(outputImageUrl, { responseType: 'arraybuffer', timeout: 30000 });
          outputBuffer = Buffer.from(imgRes.data, 'binary');
        }
      } else {
        const directUrl = extractImageUrl(taskData);
        if (directUrl) {
          const imgRes = await axios.get(directUrl, { responseType: 'arraybuffer', timeout: 30000 });
          outputBuffer = Buffer.from(imgRes.data, 'binary');
        }
      }

      if (!outputBuffer) {
        throw new Error('Manus AI completed task execution but failed to output a redesigned image. This typically happens when task limits are hit or the request fails inside the Manus agent.');
      }

      // Save output image locally
      const publicDir = path.join(process.cwd(), 'public');
      const outputsDir = path.join(publicDir, 'outputs');
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
      if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

      const outFilename = `output_${jobId}.png`;
      const outputPath = path.join(outputsDir, outFilename);

      fs.writeFileSync(outputPath, outputBuffer);

      await sleep(500);
      subject.next({
        step: 'complete',
        message: 'Manus AI Redesign Pipeline completed successfully!',
        percentage: 100,
        data: {
          originalUrl: imageUrl,
          generatedUrl: `/outputs/${outFilename}`,
        },
      });
      subject.complete();
      this.deregisterJob(jobId);

    } catch (err: any) {
      this.logger.error(`Manus pipeline error: ${err.message}`);
      subject.next({
        step: 'error',
        message: `Manus AI Redesign failed: ${err.message}`,
        percentage: 100,
      });
      subject.complete();
      this.deregisterJob(jobId);
    }
  }

  private getConfigFile(): string {
    return path.join(__dirname, 'tools.config.json');
  }

  public getTools(): any[] {
    const configPath = this.getConfigFile();
    if (!fs.existsSync(configPath)) {
      const fallbackPath = path.resolve(process.cwd(), 'src', 'image-processing', 'tools.config.json');
      if (fs.existsSync(fallbackPath)) {
        return JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      }
      return [];
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  private saveTools(tools: any[]) {
    const configPath = this.getConfigFile();
    fs.writeFileSync(configPath, JSON.stringify(tools, null, 2), 'utf8');
    
    const srcPath = path.resolve(process.cwd(), 'src', 'image-processing', 'tools.config.json');
    try {
      fs.writeFileSync(srcPath, JSON.stringify(tools, null, 2), 'utf8');
    } catch (e) {
      // Ignore if src path is not writable
    }
  }

  public createTool(data: any): any {
    const tools = this.getTools();
    const newTool = {
      id: data.id || `tool_${Date.now()}`,
      name: data.name || 'New AI Tool',
      category: data.category || 'interiors',
      description: data.description || '',
      enabled: data.enabled !== undefined ? data.enabled : true,
      widgets: data.widgets || [],
    };
    tools.push(newTool);
    this.saveTools(tools);
    return newTool;
  }

  public updateTool(id: string, data: any): any {
    const tools = this.getTools();
    let index = tools.findIndex(t => t.id === id);
    if (index === -1) {
      const newTool = {
        id: id,
        name: data.name || id,
        category: data.category || 'interiors',
        description: data.description || '',
        enabled: data.enabled !== undefined ? data.enabled : true,
        widgets: data.widgets || [],
      };
      tools.push(newTool);
      this.saveTools(tools);
      return newTool;
    }
    
    tools[index] = {
      ...tools[index],
      name: data.name !== undefined ? data.name : tools[index].name,
      category: data.category !== undefined ? data.category : tools[index].category,
      description: data.description !== undefined ? data.description : tools[index].description,
      enabled: data.enabled !== undefined ? data.enabled : tools[index].enabled,
      widgets: data.widgets !== undefined ? data.widgets : tools[index].widgets,
    };
    
    this.saveTools(tools);
    return tools[index];
  }

  public deleteTool(id: string): { success: boolean } {
    let tools = this.getTools();
    tools = tools.filter(t => t.id !== id);
    this.saveTools(tools);
    return { success: true };
  }
}
