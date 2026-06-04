import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Part } from './entities/part.entity';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Injectable()
export class PartService {
  constructor(
    @InjectRepository(Part)
    private readonly partRepository: Repository<Part>,
  ) {}

  async create(createPartDto: CreatePartDto): Promise<Part> {
    const part = this.partRepository.create(createPartDto);
    return this.partRepository.save(part);
  }

  async findAll(): Promise<Part[]> {
    return this.partRepository.find({
      relations: ['car'],
    });
  }

  async findByCarId(carId: number): Promise<Part[]> {
    return this.partRepository.find({
      where: { car_id: carId },
      relations: ['car'],
    });
  }

  async findOne(id: number): Promise<Part> {
    const part = await this.partRepository.findOne({
      where: { id },
      relations: ['car'],
    });
    if (!part) {
      throw new NotFoundException(`Part with id ${id} not found`);
    }
    return part;
  }

  async update(id: number, updatePartDto: UpdatePartDto): Promise<Part> {
    const part = await this.findOne(id);
    Object.assign(part, updatePartDto);
    return this.partRepository.save(part);
  }

  async remove(id: number): Promise<void> {
    const result = await this.partRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Part with id ${id} not found`);
    }
  }
}
