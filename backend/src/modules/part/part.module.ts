import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Part } from './entities/part.entity';
import { PartService } from './part.service';
import { PartController } from './part.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Part])],
  controllers: [PartController],
  providers: [PartService],
  exports: [PartService],
})
export class PartModule {}
