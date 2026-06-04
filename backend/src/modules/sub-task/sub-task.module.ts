import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubTask } from './entities/sub-task.entity';
import { SubTaskService } from './sub-task.service';
import { SubTaskController } from './sub-task.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SubTask])],
  controllers: [SubTaskController],
  providers: [SubTaskService],
  exports: [SubTaskService],
})
export class SubTaskModule {}
