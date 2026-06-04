import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubTaskService } from './sub-task.service';
import { CreateSubTaskDto } from './dto/create-sub-task.dto';
import { UpdateSubTaskDto } from './dto/update-sub-task.dto';
import { SubTask } from './entities/sub-task.entity';

@Controller('sub-tasks')
export class SubTaskController {
  constructor(private readonly subTaskService: SubTaskService) {}

  @Post()
  create(@Body() createSubTaskDto: CreateSubTaskDto): Promise<SubTask> {
    return this.subTaskService.create(createSubTaskDto);
  }

  @Get()
  findAll(): Promise<SubTask[]> {
    return this.subTaskService.findAll();
  }

  @Get('process/:processId')
  findByProcessId(@Param('processId') processId: string): Promise<SubTask[]> {
    return this.subTaskService.findByProcessId(+processId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SubTask> {
    return this.subTaskService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubTaskDto: UpdateSubTaskDto): Promise<SubTask> {
    return this.subTaskService.update(+id, updateSubTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.subTaskService.remove(+id);
  }
}
