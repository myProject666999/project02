import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car } from './entities/car.entity';

@Controller('cars')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Post()
  create(@Body() createCarDto: CreateCarDto): Promise<Car> {
    return this.carService.create(createCarDto);
  }

  @Get()
  findAll(): Promise<Car[]> {
    return this.carService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Car> {
    return this.carService.findOne(+id);
  }

  @Get(':id/details')
  findOneWithDetails(@Param('id') id: string): Promise<Car> {
    return this.carService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto): Promise<Car> {
    return this.carService.update(+id, updateCarDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.carService.remove(+id);
  }
}
