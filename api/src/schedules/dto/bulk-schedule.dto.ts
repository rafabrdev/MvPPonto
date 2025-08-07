import { IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateScheduleDto } from './create-schedule.dto';

export class BulkScheduleItemDto extends CreateScheduleDto {
  @IsUUID()
  userId: string;
}

export class BulkScheduleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkScheduleItemDto)
  schedules: BulkScheduleItemDto[];
}