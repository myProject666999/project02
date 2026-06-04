import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from './entities/car.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
  ) {}

  async create(createCarDto: CreateCarDto): Promise<Car> {
    const car = this.carRepository.create(createCarDto);
    return this.carRepository.save(car);
  }

  async findAll(): Promise<Car[]> {
    return this.carRepository.find({
      relations: ['processes', 'parts', 'repairLogs'],
    });
  }

  async findOne(id: number): Promise<Car> {
    const car = await this.carRepository.findOne({
      where: { id },
      relations: ['processes', 'parts', 'repairLogs'],
    });
    if (!car) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }
    return car;
  }

  async update(id: number, updateCarDto: UpdateCarDto): Promise<Car> {
    const car = await this.findOne(id);
    Object.assign(car, updateCarDto);
    return this.carRepository.save(car);
  }

  async remove(id: number): Promise<void> {
    const result = await this.carRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }
  }
}
