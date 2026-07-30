import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * GET /api/v1/uploads/tools (Returns all 20+ Dehome AI tools)
   */
  @Get('tools')
  @HttpCode(HttpStatus.OK)
  async getTools() {
    const tools = await this.uploadsService.getProductTools();
    return {
      success: true,
      message: 'Product Tools Loaded',
      data: tools,
    };
  }

  /**
   * POST /api/v1/uploads (Handles single file upload)
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      return {
        success: false,
        message: 'No file uploaded',
      };
    }

    const registeredFile = await this.uploadsService.registerUploadedFile({
      originalName: file.originalname,
      buffer: file.buffer,
      mimeType: file.mimetype,
      size: file.size,
      type: 'original_input',
    });

    return {
      success: true,
      message: 'File uploaded successfully',
      data: registeredFile,
    };
  }
}
