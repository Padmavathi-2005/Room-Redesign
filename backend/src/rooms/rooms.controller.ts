import { Controller, Post, Get, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generate(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.generateRoomRedesign(createRoomDto);
  }

  @Post('generate-2')
  @HttpCode(HttpStatus.OK)
  async generate2(@Body() body: { imageUrl: string; prompt: string }) {
    return this.roomsService.generateRoomRedesign2(body);
  }

  @Get()
  async findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }
}
