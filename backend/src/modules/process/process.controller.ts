import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProcessService } from './process.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { Process } from './entities/process.entity';

@Controller('processes')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Post()
  create(@Body() createProcessDto: CreateProcessDto): Promise<Process> {
    return this.processService.create(createProcessDto);
  }

  @Get()
  findAll(): Promise<Process[]> {
    return this.processService.findAll();
  }

  @Get('car/:carId')
  findByCarId(@Param('carId') carId: string): Promise<Process[]> {
    return this.processService.findByCarId(+carId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Process> {
    return this.processService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProcessDto: UpdateProcessDto): Promise<Process> {
    return this.processService.update(+id, updateProcessDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.processService.remove(+id);
  }
}
