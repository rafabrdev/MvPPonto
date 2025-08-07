import { IsEnum } from 'class-validator';
import { TimeEntryType } from '../entities/time-entry.entity';

export class CreateTimeEntryDto {
  @IsEnum(TimeEntryType)
  type: TimeEntryType;
}