import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin, AdminSchema } from './schemas/admin.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { RoomGeneration, RoomSchema } from '../../rooms/schemas/room.schema';
import { ProductTool, ProductToolSchema } from '../uploads/schemas/product-tool.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: RoomGeneration.name, schema: RoomSchema },
      { name: ProductTool.name, schema: ProductToolSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService, MongooseModule],
})
export class AdminModule {}

