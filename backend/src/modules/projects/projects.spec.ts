import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Types } from 'mongoose';

describe('ProjectsService Test Suite (Project & Generation Flow)', () => {
  let service: ProjectsService;
  let mockProjectModel: any;
  let mockProjectRoomModel: any;
  let mockConversationModel: any;
  let mockMessageModel: any;
  let mockGenerationModel: any;

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockProjectId = '507f1f77bcf86cd799439033';
  const mockRoomId = '507f1f77bcf86cd799439044';

  const mockProjectDoc: any = {
    _id: new Types.ObjectId(mockProjectId),
    name: 'Dream Modern Villa',
    description: 'Complete home redesign',
    theme: 'Modern Minimalist',
    coverImage: 'https://example.com/cover.jpg',
    manusChatId: 'manus_task_999',
    userId: mockUserId,
    rooms: [mockRoomId],
    totalRooms: 1,
    totalGeneratedImages: 0,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: function () {
      return { ...this };
    },
  };

  beforeEach(async () => {
    const dbProjectsStore: Map<string, any> = new Map();
    dbProjectsStore.set(mockProjectId, mockProjectDoc);

    const dbRoomsStore: Map<string, any> = new Map();
    dbRoomsStore.set(mockRoomId, {
      _id: new Types.ObjectId(mockRoomId),
      projectId: new Types.ObjectId(mockProjectId),
      userId: mockUserId,
      name: 'Living Room',
      roomType: 'Living Room',
      originalImage: 'https://example.com/original.jpg',
      coverImage: 'https://example.com/original.jpg',
      imageCount: 0,
    });

    const dbGenerationsStore: Map<string, any> = new Map();

    mockProjectModel = jest.fn().mockImplementation((docData) => {
      const idStr = docData._id ? docData._id.toString() : new Types.ObjectId().toString();
      const projInstance = {
        _id: new Types.ObjectId(idStr),
        ...docData,
        rooms: docData.rooms || [],
        createdAt: docData.createdAt || new Date(),
        updatedAt: docData.updatedAt || new Date(),
        save: jest.fn().mockImplementation(async function () {
          dbProjectsStore.set(this._id.toString(), this);
          return this;
        }),
        toObject: function () {
          return { ...this };
        },
      };
      return projInstance;
    });

    mockProjectModel.findById = jest.fn().mockImplementation((id) => ({
      exec: jest.fn().mockImplementation(async () => dbProjectsStore.get(String(id)) || null),
    }));

    mockProjectModel.findOne = jest.fn().mockImplementation((query) => ({
      exec: jest.fn().mockImplementation(async () => {
        const all = Array.from(dbProjectsStore.values());
        if (query.name && query.name.$regex) {
          return all.find((p) => p.name && query.name.$regex.test(p.name)) || null;
        }
        return all[0] || null;
      }),
    }));

    mockProjectModel.find = jest.fn().mockImplementation((query) => ({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockImplementation(async () => {
          const all = Array.from(dbProjectsStore.values());
          if (!query || Object.keys(query).length === 0) return all;
          return all.filter((p) => !query.userId || p.userId === query.userId);
        }),
      }),
    }));

    mockProjectModel.findByIdAndUpdate = jest.fn().mockImplementation((id, update, opts) => ({
      exec: jest.fn().mockImplementation(async () => {
        const item = dbProjectsStore.get(String(id));
        if (item && update.$set) {
          Object.assign(item, update.$set);
        }
        if (item && update.$addToSet && update.$addToSet.rooms) {
          if (!item.rooms) item.rooms = [];
          if (!item.rooms.includes(update.$addToSet.rooms)) {
            item.rooms.push(update.$addToSet.rooms);
          }
        }
        return item;
      }),
    }));

    mockProjectModel.findOneAndUpdate = jest.fn().mockImplementation((query, update) => ({
      exec: jest.fn().mockImplementation(async () => {
        const item = dbProjectsStore.get(String(query._id));
        if (item && update.$set) {
          Object.assign(item, update.$set);
        }
        if (item && update.$addToSet && update.$addToSet.manusTaskHistory) {
          if (!item.manusTaskHistory) item.manusTaskHistory = [];
          item.manusTaskHistory.push(update.$addToSet.manusTaskHistory);
        }
        return item;
      }),
    }));

    mockProjectModel.findByIdAndDelete = jest.fn().mockImplementation((id) => ({
      exec: jest.fn().mockImplementation(async () => {
        dbProjectsStore.delete(String(id));
        return { _id: id };
      }),
    }));

    mockProjectRoomModel = jest.fn().mockImplementation((docData) => {
      const idStr = docData._id ? docData._id.toString() : new Types.ObjectId().toString();
      const roomInstance = {
        _id: new Types.ObjectId(idStr),
        ...docData,
        save: jest.fn().mockImplementation(async function () {
          dbRoomsStore.set(this._id.toString(), this);
          return this;
        }),
        toObject: function () {
          return { ...this };
        },
      };
      return roomInstance;
    });

    mockProjectRoomModel.find = jest.fn().mockImplementation((query) => ({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockImplementation(async () => {
          return Array.from(dbRoomsStore.values());
        }),
      }),
    }));

    mockProjectRoomModel.deleteMany = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    });

    mockGenerationModel = {
      find: jest.fn().mockImplementation((query) => ({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockImplementation(async () => {
            return Array.from(dbGenerationsStore.values());
          }),
        }),
        exec: jest.fn().mockImplementation(async () => {
          return Array.from(dbGenerationsStore.values());
        }),
      })),
    };

    mockConversationModel = jest.fn().mockImplementation((docData) => ({
      _id: new Types.ObjectId(),
      ...docData,
      save: jest.fn().mockResolvedValue(docData),
    }));
    mockConversationModel.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    mockConversationModel.deleteMany = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    });

    mockMessageModel = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: 'ProjectModel', useValue: mockProjectModel },
        { provide: 'ProjectRoomModel', useValue: mockProjectRoomModel },
        { provide: 'ConversationModel', useValue: mockConversationModel },
        { provide: 'MessageModel', useValue: mockMessageModel },
        { provide: 'RoomGenerationModel', useValue: mockGenerationModel },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  describe('1. Project Creation & Initialization', () => {
    it('Should create a project with default design theme', async () => {
      const dto = {
        name: 'Penthouse Apartment',
        description: 'Luxury high rise design',
        theme: 'Japandi',
        userId: mockUserId,
      };

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Penthouse Apartment');
      expect(result.theme).toBe('Japandi');
    });

    it('Should automatically create initial room if initialRoomName is provided', async () => {
      const dto = {
        name: 'Beach House',
        initialRoomName: 'Master Suite',
        initialRoomType: 'Bedroom',
        userId: mockUserId,
      };

      const result = await service.create(dto);
      expect(result).toBeDefined();
      expect(mockProjectRoomModel).toHaveBeenCalled();
    });
  });

  describe('2. Project Retrieval & Name Lookup', () => {
    it('Should find project by exact ID', async () => {
      const project = await service.findOne(mockProjectId);
      expect(project).toBeDefined();
      expect(project.name).toBe('Dream Modern Villa');
    });

    it('Should find project by case-insensitive name query', async () => {
      const project = await service.findOneOrByName('dream modern villa', mockUserId);
      expect(project).toBeDefined();
      expect(project._id.toString()).toBe(mockProjectId);
    });

    it('Should throw NotFoundException for non-existent project ID', async () => {
      const fakeId = new Types.ObjectId().toString();
      await expect(service.findOne(fakeId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('3. Master Task ID & Concurrency Safety', () => {
    it('Should set master Manus Task ID atomically on project', async () => {
      const taskId = 'manus_task_atomic_100';
      const updated = await service.setMasterTaskIdAtomic(mockProjectId, taskId, 'PRIMARY', 'unit_test');

      expect(updated).toBeDefined();
      expect(mockProjectModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockProjectId },
        expect.objectContaining({
          $set: { manusTaskId: taskId, manusChatId: taskId },
        }),
        { new: true },
      );
    });
  });

  describe('4. Project Rooms & Output Correlation', () => {
    it('Should add room to existing project', async () => {
      const roomDto = {
        name: 'Home Office',
        roomType: 'Office',
        userId: mockUserId,
      };

      const room = await service.createRoom(mockProjectId, roomDto);
      expect(room).toBeDefined();
      expect(room.name).toBe('Home Office');
      expect(mockProjectModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('Should retrieve project image URLs for generation output correlation', async () => {
      const urls = await service.getAllProjectImageUrls(mockProjectId);
      expect(Array.isArray(urls)).toBe(true);
    });
  });

  describe('5. Project Deletion', () => {
    it('Should delete project and cascade room and conversation cleanup', async () => {
      const result = await service.remove(mockProjectId);
      expect(result.success).toBe(true);
      expect(mockProjectModel.findByIdAndDelete).toHaveBeenCalledWith(mockProjectId);
      expect(mockProjectRoomModel.deleteMany).toHaveBeenCalledWith({ projectId: mockProjectId });
    });
  });
});
