import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument, DesignTheme } from './schemas/project.schema';
import { ProjectRoom, ProjectRoomDocument } from './schemas/project-room.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { RoomGeneration, RoomDocument } from '../../rooms/schemas/room.schema';
import { CreateProjectDto, CreateProjectRoomDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  // In-memory store fallback for instant local execution
  private inMemoryProjects: Array<any> = [
    {
      _id: 'sample-project-1',
      name: 'My New Home',
      description: 'Modern interior design for my house',
      coverImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop',
      theme: 'Modern Minimalist',
      designTheme: {
        style: 'Modern Minimalist',
        primaryColors: ['warm white', 'beige'],
        secondaryColors: ['light oak'],
        accentColors: ['matte black'],
        materials: ['light oak', 'natural stone', 'linen'],
        lighting: 'warm ambient',
        furnitureStyle: 'contemporary',
        decorStyle: 'minimal',
        flooring: 'light oak',
        metalFinish: 'matte black',
      },
      manusChatId: 'manus_chat_sample_101',
      rooms: [
        {
          _id: 'room-1',
          name: 'Living Room',
          roomType: 'Living Room',
          imageCount: 8,
          coverImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop',
        },
        {
          _id: 'room-2',
          name: 'Master Bedroom',
          roomType: 'Bedroom',
          imageCount: 6,
          coverImage: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop',
        },
      ],
      totalRooms: 4,
      totalGeneratedImages: 24,
      status: 'active',
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 3600000 * 2),
    },
  ];

  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(ProjectRoom.name) private readonly roomModel: Model<ProjectRoomDocument>,
    @InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    @InjectModel(RoomGeneration.name) private readonly generationModel: Model<RoomDocument>,
  ) {}

  /**
   * Create Project (POST /api/v1/projects)
   */
  async create(dto: CreateProjectDto): Promise<any> {
    this.logger.log(`Creating Project: "${dto.name}"`);

    const defaultTheme: DesignTheme = dto.designTheme || {
      style: dto.theme || 'Modern Minimalist',
      primaryColors: ['warm white', 'beige'],
      secondaryColors: ['light oak'],
      accentColors: ['matte black'],
      materials: ['light oak', 'natural stone', 'linen'],
      lighting: dto.lighting || 'warm ambient',
      furnitureStyle: 'contemporary',
      decorStyle: 'minimal',
      flooring: 'light oak',
      metalFinish: 'matte black',
    };

    try {
      const createdProj = new this.projectModel({
        name: dto.name,
        description: dto.description || '',
        theme: dto.theme || 'Modern Minimalist',
        designTheme: defaultTheme,
        colorPalette: dto.colorPalette || '',
        lighting: dto.lighting || '',
        coverImage: dto.initialImage || '',
        manusChatId: dto.manusChatId || '',
        userId: dto.userId || '',
      });

      const savedProject = await createdProj.save();

      // If initial room name/type was provided, automatically create initial room
      if (dto.initialRoomName || dto.initialRoomType) {
        await this.createRoom(savedProject._id.toString(), {
          name: dto.initialRoomName || dto.initialRoomType || 'Living Room',
          roomType: dto.initialRoomType || 'Living Room',
          originalImage: dto.initialImage || '',
          userId: dto.userId,
        });
      }

      return this.findOne(savedProject._id.toString());
    } catch (err: any) {
      this.logger.warn(`MongoDB create project fallback: ${err.message}`);
      const newProj = {
        _id: `proj-${Date.now()}`,
        name: dto.name,
        description: dto.description || '',
        coverImage: dto.initialImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop',
        theme: dto.theme || 'Modern Minimalist',
        designTheme: defaultTheme,
        manusChatId: '',
        rooms: [],
        totalRooms: dto.initialRoomName ? 1 : 0,
        totalGeneratedImages: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.inMemoryProjects.unshift(newProj);
      return newProj;
    }
  }

  /**
   * Get User Projects sorted by updatedAt DESC (GET /api/v1/projects)
   */
  async findAll(userId?: string): Promise<any[]> {
    try {
      const filter: any = {};
      if (userId) filter.userId = userId;

      const mongoProjects = await this.projectModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .exec();

      if (mongoProjects && mongoProjects.length > 0) {
        // Enrich projects with database counts, cover images, and keywords
        const enriched = await Promise.all(
          mongoProjects.map(async (p) => {
            return await this.enrichProjectData(p);
          }),
        );
        return enriched;
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB findAll fallback: ${err.message}`);
    }

    return this.inMemoryProjects;
  }

  /**
   * Get Single Project Detail (GET /api/v1/projects/:projectId)
   */
  async findOne(id: string): Promise<any> {
    try {
      if (Types.ObjectId.isValid(id)) {
        const project = await this.projectModel.findById(id).exec();
        if (project) {
          return await this.enrichProjectData(project);
        }
      }
    } catch (err) {
      // Fall through
    }

    const found = this.inMemoryProjects.find((p) => String(p._id) === String(id));
    if (!found) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return found;
  }

  /**
   * Update Project (PUT /api/v1/projects/:projectId)
   */
  async update(id: string, dto: UpdateProjectDto): Promise<any> {
    this.logger.log(`Updating Project ID ${id}`);
    const updateData: any = { ...dto, updatedAt: new Date() };

    try {
      if (Types.ObjectId.isValid(id)) {
        const updated = await this.projectModel
          .findByIdAndUpdate(id, { $set: updateData }, { new: true })
          .exec();
        if (updated) {
          return await this.enrichProjectData(updated);
        }
      }
    } catch (err) {
      // Fall through
    }

    const index = this.inMemoryProjects.findIndex((p) => String(p._id) === String(id));
    if (index !== -1) {
      this.inMemoryProjects[index] = {
        ...this.inMemoryProjects[index],
        ...dto,
        updatedAt: new Date(),
      };
      return this.inMemoryProjects[index];
    }
    throw new NotFoundException(`Project with ID ${id} not found`);
  }

  /**
   * Update Chat Session ID while preserving session history
   */
  async updateChatId(id: string, manusChatId: string): Promise<any> {
    if (!manusChatId) return null;
    if (Types.ObjectId.isValid(id)) {
      const project = await this.projectModel.findById(id).exec();
      if (project) {
        const history: string[] = Array.isArray(project.manusChatHistory) ? [...project.manusChatHistory] : [];
        if (project.manusChatId && !history.includes(project.manusChatId)) {
          history.push(project.manusChatId);
        }
        if (!history.includes(manusChatId)) {
          history.push(manusChatId);
        }
        project.manusChatId = manusChatId;
        project.manusChatHistory = history;
        return project.save();
      }
    }
    return this.update(id, { manusChatId } as any);
  }

  /**
   * Delete Project (DELETE /api/v1/projects/:projectId)
   */
  async remove(id: string): Promise<{ success: boolean; id: string }> {
    try {
      if (Types.ObjectId.isValid(id)) {
        await this.projectModel.findByIdAndDelete(id).exec();
        await this.roomModel.deleteMany({ projectId: id }).exec();
        await this.conversationModel.deleteMany({ projectId: id }).exec();
      }
    } catch (err) {
      // Fall through
    }
    this.inMemoryProjects = this.inMemoryProjects.filter((p) => String(p._id) !== String(id));
    return { success: true, id };
  }

  /**
   * Create Room inside Project (POST /api/v1/projects/:projectId/rooms)
   */
  async createRoom(projectId: string, dto: CreateProjectRoomDto): Promise<any> {
    this.logger.log(`Creating Room "${dto.name}" in Project ${projectId}`);

    try {
      let createdRoom: ProjectRoomDocument;
      if (Types.ObjectId.isValid(projectId)) {
        createdRoom = new this.roomModel({
          projectId: new Types.ObjectId(projectId),
          userId: dto.userId || '',
          name: dto.name,
          roomType: dto.roomType || 'Living Room',
          materials: dto.materials || [],
          originalImage: dto.originalImage || '',
          coverImage: dto.originalImage || '',
          imageCount: 0,
        });
        await createdRoom.save();

        // Add room reference to Project & update project timestamp
        await this.projectModel.findByIdAndUpdate(projectId, {
          $addToSet: { rooms: createdRoom._id },
          $set: { updatedAt: new Date() },
        });

        return createdRoom;
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB create room fallback: ${err.message}`);
    }

    const memoryRoom = {
      _id: `room-${Date.now()}`,
      projectId,
      name: dto.name,
      roomType: dto.roomType || 'Living Room',
      materials: dto.materials || [],
      originalImage: dto.originalImage || '',
      coverImage: dto.originalImage || '',
      imageCount: 0,
      createdAt: new Date(),
    };

    const proj = this.inMemoryProjects.find((p) => String(p._id) === String(projectId));
    if (proj) {
      if (!proj.rooms) proj.rooms = [];
      proj.rooms.unshift(memoryRoom);
      proj.totalRooms = proj.rooms.length;
      proj.updatedAt = new Date();
    }
    return memoryRoom;
  }

  /**
   * Get Project Rooms (GET /api/v1/projects/:projectId/rooms)
   */
  async getProjectRooms(projectId: string): Promise<any[]> {
    try {
      if (Types.ObjectId.isValid(projectId)) {
        const rooms = await this.roomModel
          .find({ projectId: new Types.ObjectId(projectId) })
          .sort({ createdAt: -1 })
          .exec();
        if (rooms && rooms.length > 0) return rooms;
      }
    } catch (err) {
      // Fall through
    }

    const proj = this.inMemoryProjects.find((p) => String(p._id) === String(projectId));
    return proj ? proj.rooms || [] : [];
  }

  /**
   * Get All Generations for Project (GET /api/v1/projects/:projectId/generations)
   */
  async getProjectGenerations(projectId: string): Promise<any[]> {
    try {
      if (Types.ObjectId.isValid(projectId)) {
        const gens = await this.generationModel
          .find({ projectId: new Types.ObjectId(projectId), status: 'completed' })
          .sort({ createdAt: -1 })
          .exec();
        return gens;
      }
    } catch (err) {
      // Fall through
    }
    return [];
  }

  /**
   * Get Room Conversation & History (GET /api/v1/projects/:projectId/rooms/:roomId/conversation)
   */
  async getRoomConversation(projectId: string, roomId: string): Promise<any> {
    try {
      if (Types.ObjectId.isValid(projectId) && Types.ObjectId.isValid(roomId)) {
        let conv = await this.conversationModel
          .findOne({ projectId: new Types.ObjectId(projectId), roomId: new Types.ObjectId(roomId) })
          .exec();

        if (!conv) {
          conv = new this.conversationModel({
            projectId: new Types.ObjectId(projectId),
            roomId: new Types.ObjectId(roomId),
            title: `Room Conversation - ${roomId}`,
          });
          await conv.save();
        }

        const messages = await this.messageModel
          .find({ conversationId: conv._id })
          .sort({ createdAt: 1 })
          .exec();

        return {
          conversation: conv,
          messages,
        };
      }
    } catch (err) {
      // Fall through
    }

    return {
      conversation: { _id: `conv-${roomId}`, projectId, roomId, title: 'Room History' },
      messages: [],
    };
  }

  /**
   * Helper: Enrich Project Data with calculated DB counts, cover image, and design keywords
   */
  private async enrichProjectData(projectDoc: ProjectDocument): Promise<any> {
    const projObj = projectDoc.toObject ? projectDoc.toObject() : projectDoc;
    const projId = projObj._id.toString();

    // 1. Fetch Rooms & Generations count from database
    let roomsList: any[] = [];
    let generationsList: any[] = [];

    try {
      roomsList = await this.roomModel.find({ projectId: new Types.ObjectId(projId) }).sort({ createdAt: -1 }).exec();
      generationsList = await this.generationModel
        .find({ projectId: new Types.ObjectId(projId), status: 'completed' })
        .sort({ createdAt: -1 })
        .exec();
    } catch (e) {
      // Fall through
    }

    const totalRooms = roomsList.length || (projObj.rooms ? projObj.rooms.length : 0);
    const totalGeneratedImages = generationsList.length;

    // 2. Resolve Cover Image (latest successful generated image, or 1st uploaded room image)
    let coverImage = projObj.coverImage || '';
    if (generationsList.length > 0 && generationsList[0].generatedImage) {
      coverImage = generationsList[0].generatedImage;
    } else if (roomsList.length > 0 && roomsList[0].originalImage) {
      coverImage = roomsList[0].originalImage;
    }

    if (!coverImage) {
      coverImage = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop';
    }

    // 3. Derive important design keywords (e.g. "Interior Design • Bedroom • Modern")
    const keywords: string[] = ['Interior Design'];
    if (roomsList.length > 0 && roomsList[0].roomType) {
      keywords.push(roomsList[0].roomType);
    } else {
      keywords.push('Living Room');
    }
    keywords.push(projObj.theme || 'Modern');

    // 4. Custom instructions summary snippet
    let customInstructionsSummary = '';
    if (generationsList.length > 0 && generationsList[0].customInstructions) {
      customInstructionsSummary = generationsList[0].customInstructions;
    }

    return {
      ...projObj,
      coverImage,
      rooms: roomsList.length > 0 ? roomsList : projObj.rooms,
      totalRooms,
      totalGeneratedImages,
      keywords: keywords.join(' • '),
      customInstructionsSummary,
    };
  }

  /**
   * Helper: Add Room ID to project rooms array
   */
  async addRoomToProject(id: string, roomId: any): Promise<any> {
    try {
      if (Types.ObjectId.isValid(id)) {
        return await this.projectModel
          .findByIdAndUpdate(
            id,
            { $addToSet: { rooms: roomId }, $set: { updatedAt: new Date() } },
            { new: true },
          )
          .exec();
      }
    } catch (e) {
      // Fall through
    }

    const proj = this.inMemoryProjects.find((p) => String(p._id) === String(id));
    if (proj) {
      if (!proj.rooms) proj.rooms = [];
      if (!proj.rooms.includes(roomId)) {
        proj.rooms.push(roomId);
      }
      proj.totalRooms = proj.rooms.length;
      proj.updatedAt = new Date();
      return proj;
    }
  }
}
