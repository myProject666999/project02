import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RepairLogService } from './repair-log.service';
import { CreateRepairLogDto } from './dto/create-repair-log.dto';
import { UpdateRepairLogDto } from './dto/update-repair-log.dto';
import { RepairLog } from './entities/repair-log.entity';

@Controller('repair-logs')
export class RepairLogController {
  constructor(private readonly repairLogService: RepairLogService) {}

  @Post()
  create(@Body() createRepairLogDto: CreateRepairLogDto): Promise<RepairLog> {
    return this.repairLogService.create(createRepairLogDto);
  }

  @Get()
  findAll(): Promise<RepairLog[]> {
    return this.repairLogService.findAll();
  }

  @Get('car/:carId')
  findByCarId(@Param('carId') carId: string): Promise<RepairLog[]> {
    return this.repairLogService.findByCarId(+carId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<RepairLog> {
    return this.repairLogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRepairLogDto: UpdateRepairLogDto): Promise<RepairLog> {
    return this.repairLogService.update(+id, updateRepairLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.repairLogService.remove(+id);
  }
}
