import { IsString, IsInt, IsEnum, IsDateString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { PartStatus } from '../../../common/enums';

export class CreatePartDto {
  @IsInt()
  car_id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  part_number?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsNumber()
  @IsOptional()
  unit_price?: number;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsBoolean()
  @IsOptional()
  is_original?: boolean;

  @IsDateString()
  @IsOptional()
  order_date?: Date;

  @IsDateString()
  @IsOptional()
  arrival_date?: Date;

  @IsEnum(PartStatus)
  @IsOptional()
  status?: PartStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
