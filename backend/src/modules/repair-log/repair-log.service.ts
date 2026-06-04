import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepairLog } from './entities/repair-log.entity';
import { CreateRepairLogDto } from './dto/create-repair-log.dto';
import { UpdateRepairLogDto } from './dto/update-repair-log.dto';

@Injectable()
export class RepairLogService {
  constructor(
    @InjectRepository(RepairLog)
    private readonly repairLogRepository: Repository<RepairLog>,
  ) {}

  async create(createRepairLogDto: CreateRepairLogDto): Promise<RepairLog> {
    const repairLog = this.repairLogRepository.create(createRepairLogDto);
    return this.repairLogRepository.save(repairLog);
  }

  async findAll(): Promise<RepairLog[]> {
    return this.repairLogRepository.find({
      relations: ['car'],
      order: { log_date: 'DESC' },
    });
  }

  async findByCarId(carId: number): Promise<RepairLog[]> {
    return this.repairLogRepository.find({
      where: { car_id: carId },
      relations: ['car'],
      order: { log_date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<RepairLog> {
    const repairLog = await this.repairLogRepository.findOne({
      where: { id },
      relations: ['car'],
    });
    if (!repairLog) {
      throw new NotFoundException(`RepairLog with id ${id} not found`);
    }
    return repairLog;
  }

  async update(id: number, updateRepairLogDto: UpdateRepairLogDto): Promise<RepairLog> {
    const repairLog = await this.findOne(id);
    Object.assign(repairLog, updateRepairLogDto);
    return this.repairLogRepository.save(repairLog);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repairLogRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`RepairLog with id ${id} not found`);
    }
  }
}
