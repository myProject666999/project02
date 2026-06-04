import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from './entities/car.entity';
import { CarService } from './car.service';
import { CarController } from './car.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Car])],
  controllers: [CarController],
  providers: [CarService],
  exports: [CarService],
})
export class CarModule {}
