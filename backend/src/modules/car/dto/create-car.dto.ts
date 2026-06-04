import { IsString, IsInt, IsEnum, IsArray, IsOptional, Length } from 'class-validator';
import { RestorationRoute } from '../../../common/enums';

export class CreateCarDto {
  @IsString()
  @Length(17, 17)
  vin: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsInt()
  year: number;

  @IsString()
  name: string;

  @IsEnum(RestorationRoute)
  @IsOptional()
  restoration_route?: RestorationRoute;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  original_photos?: string[];

  @IsString()
  @IsOptional()
  description?: string;
}
