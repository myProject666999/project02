import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PartService } from './part.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { Part } from './entities/part.entity';

@Controller('parts')
export class PartController {
  constructor(private readonly partService: PartService) {}

  @Post()
  create(@Body() createPartDto: CreatePartDto): Promise<Part> {
    return this.partService.create(createPartDto);
  }

  @Get()
  findAll(): Promise<Part[]> {
    return this.partService.findAll();
  }

  @Get('car/:carId')
  findByCarId(@Param('carId') carId: string): Promise<Part[]> {
    return this.partService.findByCarId(+carId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Part> {
    return this.partService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePartDto: UpdatePartDto): Promise<Part> {
    return this.partService.update(+id, updatePartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.partService.remove(+id);
  }
}
