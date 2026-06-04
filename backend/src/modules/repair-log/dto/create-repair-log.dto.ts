import { IsString, IsInt, IsDateString, IsArray, IsOptional } from 'class-validator';

export class CreateRepairLogDto {
  @IsInt()
  car_id: number;

  @IsDateString()
  log_date: Date;

  @IsString()
  content: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];
}
