import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubTask } from './entities/sub-task.entity';
import { CreateSubTaskDto } from './dto/create-sub-task.dto';
import { UpdateSubTaskDto } from './dto/update-sub-task.dto';

@Injectable()
export class SubTaskService {
  constructor(
    @InjectRepository(SubTask)
    private readonly subTaskRepository: Repository<SubTask>,
  ) {}

  async create(createSubTaskDto: CreateSubTaskDto): Promise<SubTask> {
    const subTask = this.subTaskRepository.create(createSubTaskDto);
    return this.subTaskRepository.save(subTask);
  }

  async findAll(): Promise<SubTask[]> {
    return this.subTaskRepository.find({
      relations: ['process'],
      order: { task_order: 'ASC' },
    });
  }

  async findByProcessId(processId: number): Promise<SubTask[]> {
    return this.subTaskRepository.find({
      where: { process_id: processId },
      relations: ['process'],
      order: { task_order: 'ASC' },
    });
  }

  async findOne(id: number): Promise<SubTask> {
    const subTask = await this.subTaskRepository.findOne({
      where: { id },
      relations: ['process'],
    });
    if (!subTask) {
      throw new NotFoundException(`SubTask with id ${id} not found`);
    }
    return subTask;
  }

  async update(id: number, updateSubTaskDto: UpdateSubTaskDto): Promise<SubTask> {
    const subTask = await this.findOne(id);
    Object.assign(subTask, updateSubTaskDto);
    return this.subTaskRepository.save(subTask);
  }

  async remove(id: number): Promise<void> {
    const result = await this.subTaskRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`SubTask with id ${id} not found`);
    }
  }
}
