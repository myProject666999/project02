import { IsString, IsInt, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ProcessStatus } from '../../../common/enums';

export class CreateProcessDto {
  @IsInt()
  car_id: number;

  @IsString()
  name: string;

  @IsInt()
  process_order: number;

  @IsEnum(ProcessStatus)
  @IsOptional()
  status?: ProcessStatus;

  @IsDateString()
  @IsOptional()
  start_date?: Date;

  @IsDateString()
  @IsOptional()
  end_date?: Date;

  @IsString()
  @IsOptional()
  description?: string;
}
