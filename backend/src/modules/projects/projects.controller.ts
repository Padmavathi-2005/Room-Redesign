import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, CreateProjectRoomDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * POST /api/v1/projects - Create new project
   */
  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  /**
   * GET /api/v1/projects - Get all user projects sorted by updatedAt DESC
   */
  @Get()
  findAll(@Query('userId') userId?: string) {
    return this.projectsService.findAll(userId);
  }

  /**
   * GET /api/v1/projects/:projectId - Get single project details & statistics
   */
  @Get(':projectId')
  findOne(@Param('projectId') projectId: string) {
    return this.projectsService.findOne(projectId);
  }

  /**
   * PUT /api/v1/projects/:projectId - Update project details & designTheme
   */
  @Put(':projectId')
  update(@Param('projectId') projectId: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(projectId, updateProjectDto);
  }

  /**
   * PATCH /api/v1/projects/:projectId - Partial update project
   */
  @Patch(':projectId')
  patchUpdate(@Param('projectId') projectId: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(projectId, updateProjectDto);
  }

  /**
   * DELETE /api/v1/projects/:projectId - Delete project & associated rooms
   */
  @Delete(':projectId')
  remove(@Param('projectId') projectId: string) {
    return this.projectsService.remove(projectId);
  }

  /**
   * POST /api/v1/projects/:projectId/rooms - Create room inside project
   */
  @Post(':projectId/rooms')
  createRoom(
    @Param('projectId') projectId: string,
    @Body() createRoomDto: CreateProjectRoomDto,
  ) {
    return this.projectsService.createRoom(projectId, createRoomDto);
  }

  /**
   * GET /api/v1/projects/:projectId/rooms - Get all rooms in project
   */
  @Get(':projectId/rooms')
  getProjectRooms(@Param('projectId') projectId: string) {
    return this.projectsService.getProjectRooms(projectId);
  }

  /**
   * GET /api/v1/projects/:projectId/generations - Get all completed generations in project
   */
  @Get(':projectId/generations')
  getProjectGenerations(@Param('projectId') projectId: string) {
    return this.projectsService.getProjectGenerations(projectId);
  }

  /**
   * GET /api/v1/projects/:projectId/rooms/:roomId/conversation - Get room conversation history
   */
  @Get(':projectId/rooms/:roomId/conversation')
  getRoomConversation(
    @Param('projectId') projectId: string,
    @Param('roomId') roomId: string,
  ) {
    return this.projectsService.getRoomConversation(projectId, roomId);
  }
}
