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
