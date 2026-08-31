import { Controller, Post, Body, Param, Sse, MessageEvent, BadRequestException, Logger, Get, Put, Delete } from '@nestjs/common';
import { ImageProcessingService, ProgressState } from './image-processing.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface RedesignRequestDto {
  imageUrl: string;
  styleUrl?: string;
  prompt: string;
  controlNetStrength?: number;
  ipAdapterStrength?: number;
  apiProvider?: 'manus' | 'openai';
  model?: string;
  apiKey?: string;
}

@Controller('api/redesign')
export class ImageProcessingController {
  private readonly logger = new Logger(ImageProcessingController.name);

  constructor(private readonly imageProcessingService: ImageProcessingService) {}

  @Get('tools')
  async getTools() {
    return this.imageProcessingService.getTools();
  }

  @Post('tools')
  async createTool(@Body() body: any) {
    return this.imageProcessingService.createTool(body);
  }

  @Put('tools/:id')
  async updateTool(@Param('id') id: string, @Body() body: any) {
    return this.imageProcessingService.updateTool(id, body);
  }

  @Delete('tools/:id')
  async deleteTool(@Param('id') id: string) {
    return this.imageProcessingService.deleteTool(id);
  }

  @Post()
  async queueRedesign(@Body() body: RedesignRequestDto) {
    const { imageUrl, styleUrl, prompt, apiKey } = body;

    if (!imageUrl) {
      throw new BadRequestException('imageUrl parameter is required.');
    }
    if (!prompt) {
      throw new BadRequestException('prompt parameter is required.');
    }

    const provider = 'manus';
    const selectedModel = 'manus-v2';

    const jobId = `job_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.logger.log(`Queueing redesign job ${jobId} using provider [manus] model [manus-v2] for image ${imageUrl.slice(0, 50)}...`);

    // Register job subjects in service
    this.imageProcessingService.registerJob(jobId);

    // Run the pipeline asynchronously (do not await)
    this.imageProcessingService.executeRedesign(
      jobId,
      imageUrl,
      styleUrl,
      prompt,
      provider,
      selectedModel,
      apiKey,
    ).catch(err => {
      this.logger.error(`Error executing redesign for job ${jobId}: ${err.message}`);
    });

    return { jobId };
  }

  @Sse('progress/:jobId')
  streamProgress(@Param('jobId') jobId: string): Observable<MessageEvent> {
    const progress$ = this.imageProcessingService.getJobProgress(jobId);
    
    if (!progress$) {
      return new Observable(subscriber => {
        subscriber.next({
          data: {
            step: 'error',
            message: `Job ${jobId} not found or already finished.`,
            percentage: 0
          }
        });
        subscriber.complete();
      });
    }

    return progress$.pipe(
      map((state: ProgressState) => {
        return {
          data: {
            step: state.step,
            message: state.message,
            percentage: state.percentage,
            data: state.data
          }
        } as MessageEvent;
      })
    );
  }
}
