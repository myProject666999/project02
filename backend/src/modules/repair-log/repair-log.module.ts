import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepairLog } from './entities/repair-log.entity';
import { RepairLogService } from './repair-log.service';
import { RepairLogController } from './repair-log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RepairLog])],
  controllers: [RepairLogController],
  providers: [RepairLogService],
  exports: [RepairLogService],
})
export class RepairLogModule {}
