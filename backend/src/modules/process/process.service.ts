import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Process } from './entities/process.entity';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { ProcessStatus } from '../../common/enums';

@Injectable()
export class ProcessService {
  constructor(
    @InjectRepository(Process)
    private readonly processRepository: Repository<Process>,
  ) {}

  async create(createProcessDto: CreateProcessDto): Promise<Process> {
    const process = this.processRepository.create(createProcessDto);
    return this.processRepository.save(process);
  }

  async findAll(): Promise<Process[]> {
    return this.processRepository.find({
      relations: ['car', 'subTasks'],
      order: { process_order: 'ASC' },
    });
  }

  async findByCarId(carId: number): Promise<Process[]> {
    return this.processRepository.find({
      where: { car_id: carId },
      relations: ['car', 'subTasks'],
      order: { process_order: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Process> {
    const process = await this.processRepository.findOne({
      where: { id },
      relations: ['car', 'subTasks'],
    });
    if (!process) {
      throw new NotFoundException(`Process with id ${id} not found`);
    }
    return process;
  }

  async update(id: number, updateProcessDto: UpdateProcessDto): Promise<Process> {
    const process = await this.findOne(id);

    if (updateProcessDto.status && updateProcessDto.status !== process.status) {
      await this.checkPreviousProcessCompletion(process.car_id, process.process_order, updateProcessDto.status);
    }

    Object.assign(process, updateProcessDto);
    return this.processRepository.save(process);
  }

  private async checkPreviousProcessCompletion(
    carId: number,
    currentOrder: number,
    newStatus: ProcessStatus,
  ): Promise<void> {
    if (newStatus === ProcessStatus.PENDING) {
      return;
    }

    if (currentOrder <= 1) {
      return;
    }

    const previousProcesses = await this.processRepository.find({
      where: {
        car_id: carId,
        process_order: LessThan(currentOrder),
      },
    });

    const incompletePrevious = previousProcesses.filter(
      (p) => p.status !== ProcessStatus.COMPLETED,
    );

    if (incompletePrevious.length > 0) {
      const names = incompletePrevious.map((p) => `#${p.process_order} ${p.name}`).join(', ');
      throw new BadRequestException(
        `Cannot start this process. Previous processes not completed: ${names}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.processRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Process with id ${id} not found`);
    }
  }
}
