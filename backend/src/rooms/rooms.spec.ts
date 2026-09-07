import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { UploadsService } from '../modules/uploads/uploads.service';
import { ProviderManagerService } from '../modules/provider-manager/provider-manager.service';
import { ProjectsService } from '../modules/projects/projects.service';
import { QueueWorkerService } from '../queue/queue-worker.service';
import { SubscriptionService } from '../modules/subscription/subscription.service';

describe('RoomsService - AI Generation & Credit Safety Test Suite (No API Key Required)', () => {
  let service: RoomsService;
  let mockRoomModel: any;
  let mockUserModel: any;
  let mockUploadsService: any;
  let mockProviderManagerService: any;
  let mockProjectsService: any;
  let mockQueueWorkerService: any;
  let mockSubscriptionService: any;
  let mockPlanModel: any;

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockRoomId = '507f1f77bcf86cd799439022';

  const mockUser: any = {
    _id: mockUserId,
    email: 'test@example.com',
    plan: 'pro',
    credits: 20,
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    mockUser.credits = 20;
    mockUser.plan = 'pro';

    const dbRoomsStore: Map<string, any> = new Map();

    mockPlanModel = {
      findOne: jest.fn().mockImplementation(({ code }) => ({
        exec: jest.fn().mockResolvedValue({
          code,
          accessibleModels: ['interior-design', '3d-floor-plan', 'sketch-to-render', '8k-render'],
          isActive: true,
        }),
      })),
    };

    mockUserModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      }),
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      }),
      findByIdAndUpdate: jest.fn().mockImplementation((id, update) => {
        if (update && update.$inc && update.$inc.credits !== undefined) {
          mockUser.credits += update.$inc.credits;
        }
        return { exec: jest.fn().mockResolvedValue(mockUser) };
      }),
      db: {
        model: jest.fn().mockReturnValue(mockPlanModel),
      },
    };

    // Mock Room Model supporting constructor and query methods
    mockRoomModel = jest.fn().mockImplementation((docData) => {
      const roomInstance = {
        _id: mockRoomId,
        ...docData,
        status: docData.status || 'pending',
        save: jest.fn().mockImplementation(async function () {
          dbRoomsStore.set(this._id, this);
          return this;
        }),
        toObject: function () {
          return { ...this };
        },
      };
      return roomInstance;
    });

    mockRoomModel.findById = jest.fn().mockImplementation((id) => ({
      exec: jest.fn().mockImplementation(async () => dbRoomsStore.get(id) || null),
    }));

    mockRoomModel.find = jest.fn().mockImplementation((filter) => ({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockImplementation(async () => {
          const all = Array.from(dbRoomsStore.values());
          if (!filter || Object.keys(filter).length === 0) return all;
          return all.filter((r) => !filter.userId || r.userId === filter.userId);
        }),
      }),
    }));

    mockRoomModel.findByIdAndUpdate = jest.fn().mockImplementation((id, update) => ({
      exec: jest.fn().mockImplementation(async () => {
        const item = dbRoomsStore.get(id);
        if (item && update.$set) {
          Object.assign(item, update.$set);
        }
        return item;
      }),
    }));

    mockRoomModel.findByIdAndDelete = jest.fn().mockImplementation((id) => ({
      exec: jest.fn().mockImplementation(async () => {
        dbRoomsStore.delete(id);
        return { _id: id };
      }),
    }));

    mockRoomModel.deleteMany = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    });

    mockUploadsService = {
      registerUploadedFile: jest.fn().mockResolvedValue({
        _id: 'media_file_123',
        url: 'https://example.com/input.jpg',
      }),
    };

    mockProviderManagerService = {
      generateImage: jest.fn().mockResolvedValue({
        imageUrl: 'https://example.com/mock-flux-result.png',
        providerName: 'MockFluxProvider',
      }),
      generateImageWithVertex: jest.fn().mockResolvedValue({
        imageUrl: 'https://example.com/mock-vertex-result.png',
        chatId: 'chat_vertex_123',
        providerName: 'MockVertex',
        modelName: 'imagen-3',
      }),
      generateImageWithRoomWhiz: jest.fn().mockResolvedValue({
        imageUrl: 'https://example.com/mock-roomwhiz-result.png',
        chatId: 'chat_rw_123',
        providerName: 'RoomWhiz AI',
        modelName: 'flux-1-dev',
      }),
    };

    mockProjectsService = {
      findOneOrByName: jest.fn().mockResolvedValue(null),
      addRoomToProject: jest.fn().mockResolvedValue(true),
    };

    mockQueueWorkerService = {
      triggerJobDirectly: jest.fn().mockImplementation(async (roomDoc) => {
        // Mock instant background worker execution: sets room status to completed
        roomDoc.status = 'completed';
        roomDoc.generatedImage = 'https://example.com/mock-generated-room.png';
        dbRoomsStore.set(roomDoc._id, roomDoc);
      }),
    };

    mockSubscriptionService = {
      deductCreditsAtomic: jest.fn().mockImplementation(async (userId, amount) => {
        mockUser.credits -= amount;
        return mockUser;
      }),
      refundCreditsAtomic: jest.fn().mockImplementation(async (userId, amount) => {
        mockUser.credits += amount;
        return mockUser;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: 'RoomGenerationModel', useValue: mockRoomModel },
        { provide: 'UserModel', useValue: mockUserModel },
        { provide: UploadsService, useValue: mockUploadsService },
        { provide: ProviderManagerService, useValue: mockProviderManagerService },
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: QueueWorkerService, useValue: mockQueueWorkerService },
        { provide: SubscriptionService, useValue: mockSubscriptionService },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
  });

  describe('1. Credit Cost Calculation Rules', () => {
    it('Should calculate 2 credits for standard interior-design tool', () => {
      const cost = service.calculateGenerationCost('interior-design');
      expect(cost).toBe(2);
    });

    it('Should calculate 4 credits for premium tools (3d-floor-plan, sketch-to-render, 8k-render)', () => {
      expect(service.calculateGenerationCost('3d-floor-plan')).toBe(4);
      expect(service.calculateGenerationCost('sketch-to-render')).toBe(4);
      expect(service.calculateGenerationCost('8k-render')).toBe(4);
    });

    it('Should default to 2 credits if toolSlug is omitted or unknown', () => {
      expect(service.calculateGenerationCost()).toBe(2);
      expect(service.calculateGenerationCost('custom-unknown-tool')).toBe(2);
    });
  });

  describe('2. Plan Boundary Security & Access Checks', () => {
    it('Should reject tool generation with ForbiddenException if plan tier does not permit tool', async () => {
      mockUser.plan = 'free';
      mockPlanModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          code: 'free',
          accessibleModels: ['interior-design'],
          isActive: true,
        }),
      });

      const dto: any = {
        originalImage: 'https://example.com/source.jpg',
        roomType: 'Living Room',
        toolSlug: '8k-render',
      };

      await expect(
        service.generateRoomRedesign(mockUserId, dto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('3. Zero-API-Key Room Redesign Generation Flow', () => {
    it('Should successfully complete generation, deduct credits atomically, and return generated image', async () => {
      const dto: any = {
        originalImage: 'https://example.com/source.jpg',
        roomType: 'Living Room',
        designStyle: 'Modern Minimalist',
        toolSlug: 'interior-design',
      };

      const initialCredits = mockUser.credits; // 20
      const result = await service.generateRoomRedesign(mockUserId, dto);

      expect(result).toBeDefined();
      expect(result.status).toBe('completed');
      expect(result.generatedImage).toBe('https://example.com/mock-generated-room.png');
      expect(mockUser.credits).toBe(initialCredits - 2); // 18 left
      expect(mockQueueWorkerService.triggerJobDirectly).toHaveBeenCalled();
    });
  });

  describe('4. AI Generation Failure & Auto-Refund Flow', () => {
    it('Should trigger refundCreditsAtomic when AI queue job fails, protecting user credits', async () => {
      // Configure QueueWorker to simulate worker failure
      mockQueueWorkerService.triggerJobDirectly.mockImplementation(async (roomDoc) => {
        roomDoc.status = 'failed';
        roomDoc.error = 'Mock provider timeout or model outage';
      });

      const dto: any = {
        originalImage: 'https://example.com/source.jpg',
        roomType: 'Bedroom',
        toolSlug: 'interior-design',
      };

      const startCredits = mockUser.credits; // 20

      await expect(
        service.generateRoomRedesign(mockUserId, dto),
      ).rejects.toThrow(BadRequestException);

      // Verify credit was deducted initially (20 -> 18) but immediately auto-refunded (18 -> 20)
      expect(mockSubscriptionService.refundCreditsAtomic).toHaveBeenCalledWith(
        mockUserId,
        2,
        expect.stringContaining('Auto-Refund'),
        expect.any(Object),
      );
      expect(mockUser.credits).toBe(startCredits);
    });
  });

  describe('5. Direct Generation Flows (Zero API Cost Mocks)', () => {
    it('Should process generateRoomRedesign2 with provider manager mock without calling external network', async () => {
      const result = await service.generateRoomRedesign2({
        imageUrl: 'https://example.com/room.jpg',
        prompt: 'Modern Japandi Living Room',
      });

      expect(result.success).toBe(true);
      expect(result.imageUrl).toBe('https://example.com/mock-flux-result.png');
      expect(mockProviderManagerService.generateImage).toHaveBeenCalledWith({
        prompt: 'Modern Japandi Living Room',
        imageUrl: 'https://example.com/room.jpg',
        negativePrompt: '',
      });
    });

    it('Should process testManusDirectly with mocked AI output without spending credits', async () => {
      const result = await service.testManusDirectly({
        imageUrl: 'https://example.com/room.jpg',
        prompt: 'Luxury Villa Bedroom',
      });

      expect(result.success).toBe(true);
      expect(result.outputImageUrl).toBeDefined();
      expect(result.providerName).toBeDefined();
    });
  });

  describe('6. Room History & Ownership Security', () => {
    it('Should retrieve status of a created room generation', async () => {
      const mockCreatedRoom = new mockRoomModel({
        _id: mockRoomId,
        status: 'completed',
        generatedImage: 'https://example.com/mock-generated-room.png',
        originalImage: 'https://example.com/source.jpg',
      });
      await mockCreatedRoom.save();

      const statusRes = await service.getRoomStatus(mockRoomId);
      expect(statusRes).toBeDefined();
      expect(statusRes.status).toBe('completed');
      expect(statusRes.generatedImage).toBe('https://example.com/mock-generated-room.png');
    });

    it('Should throw ForbiddenException when user attempts to access room owned by another user', async () => {
      const otherUserRoom = {
        _id: '507f1f77bcf86cd799439099',
        userId: 'different_user_999',
      };
      mockRoomModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(otherUserRoom),
      });

      await expect(
        service.findOneForUser('507f1f77bcf86cd799439099', mockUserId, false),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
