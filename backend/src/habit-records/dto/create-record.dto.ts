import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class CreateRecordDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
