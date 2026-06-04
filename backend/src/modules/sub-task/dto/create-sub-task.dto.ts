import { IsString, IsInt, IsEnum, IsOptional } from 'class-validator';
import { ProcessStatus } from '../../../common/enums';

export class CreateSubTaskDto {
  @IsInt()
  process_id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  task_order: number;

  @IsEnum(ProcessStatus)
  @IsOptional()
  status?: ProcessStatus;
}
