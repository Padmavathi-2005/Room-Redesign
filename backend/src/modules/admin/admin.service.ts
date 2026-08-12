import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import { RoomGeneration, RoomDocument } from '../../rooms/schemas/room.schema';
import { ProductTool, ProductToolDocument } from '../uploads/schemas/product-tool.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(RoomGeneration.name) private readonly roomModel: Model<RoomDocument>,
    @InjectModel(ProductTool.name) private readonly productToolModel: Model<ProductToolDocument>,
  ) {}

  /**
   * Get overall system dashboard metrics
   */
  async getDashboardOverview() {
    const [totalUsers, totalProjects, totalConvertedImages] = await Promise.all([
      this.userModel.countDocuments(),
      this.projectModel.countDocuments(),
      this.roomModel.countDocuments({ status: { $ne: 'FAILED' } }),
    ]);

    const recentUsers = await this.userModel.find().sort({ createdAt: -1 }).limit(5).select('-passwordHash').exec();
    const recentProjects = await this.projectModel.find().sort({ createdAt: -1 }).limit(5).exec();

    return {
      totalUsers,
      totalProjects,
      totalConvertedImages,
      recentUsers,
      recentProjects,
    };
  }

  /**
   * List all users with aggregated project & room count stats (excludes Admin system accounts)
   */
  async getAllUsers(): Promise<Array<Record<string, any>>> {
    const users = await this.userModel
      .find({ role: { $ne: UserRole.ADMIN } })
      .sort({ createdAt: -1 })
      .select('-passwordHash')
      .lean()
      .exec();


    const userStats = await Promise.all(
      users.map(async (u) => {
        const uId = u._id;
        const [projectCount, roomCount] = await Promise.all([
          this.projectModel.countDocuments({ userId: uId }),
          this.roomModel.countDocuments({ userId: uId }),
        ]);

        return {
          ...u,
          projectCount,
          roomCount,
        };
      }),
    );

    return userStats;
  }

  /**
   * Update user details (role, credits, subscription tier)
   */
  async updateUser(userId: string, updateData: { role?: UserRole; credits?: number; subscriptionTier?: string }) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (updateData.role) user.role = updateData.role;
    if (updateData.credits !== undefined) user.credits = updateData.credits;
    if (updateData.subscriptionTier) (user as any).subscriptionTier = updateData.subscriptionTier;

    await user.save();
    return user;
  }

  /**
   * Top up / Add credits to user account
   */
  async addCreditsToUser(userId: string, amount: number) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.credits = Math.max(0, (user.credits ?? 0) + amount);
    await user.save();
    return user;
  }

  /**
   * Delete a user account and associated projects
   */
  async deleteUser(userId: string) {
    const user = await this.userModel.findByIdAndDelete(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Clean up user projects and room generations
    await Promise.all([
      this.projectModel.deleteMany({ userId }),
      this.roomModel.deleteMany({ userId }),
    ]);

    return { success: true, message: `User ${userId} deleted successfully` };
  }

  /**
   * List all projects across all users with room counts and owner info
   */
  async getAllProjects(): Promise<Array<Record<string, any>>> {
    const projects = await this.projectModel
      .find()
      .populate('userId', 'email firstName lastName role')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const projectsWithStats = await Promise.all(
      projects.map(async (proj) => {
        const pId = proj._id;
        const roomCount = await this.roomModel.countDocuments({ projectId: pId });
        return {
          ...proj,
          roomCount,
        };
      }),
    );

    return projectsWithStats;
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string) {
    const project = await this.projectModel.findByIdAndDelete(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    await this.roomModel.deleteMany({ projectId });
    return { success: true, message: `Project ${projectId} deleted successfully` };
  }

  /**
   * List all AI generated room images platform-wide
   */
  async getAllConvertedImages() {
    const images = await this.roomModel
      .find()
      .populate('userId', 'email firstName lastName')
      .populate('projectId', 'name theme')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return images;
  }

  /**
   * List all Product AI Models / Tools
   */
  async getAllProductTools() {
    return this.productToolModel.find().sort({ createdAt: 1 }).exec();
  }

  /**
   * Update a Product AI Model details and images
   */
  async updateProductTool(id: string, updateData: any) {
    const tool = await this.productToolModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!tool) {
      const toolBySlug = await this.productToolModel.findOneAndUpdate({ slug: id }, updateData, { new: true });
      if (!toolBySlug) {
        throw new NotFoundException(`Product tool with ID or slug ${id} not found`);
      }
      return toolBySlug;
    }
    return tool;
  }

  /**
   * Save uploaded image into uploads/images directory and return static URL path
   */
  async saveToolImage(file: any) {
    if (!file) {
      throw new NotFoundException('No image file uploaded');
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname || 'image.jpg') || '.jpg';
    const filename = `model_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    if (file.buffer) {
      fs.writeFileSync(filePath, file.buffer);
    }

    const relativeUrl = `/uploads/images/${filename}`;
    return {
      filename,
      url: relativeUrl,
    };
  }
}
