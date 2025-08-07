import { TimeEntryType } from '../entities/time-entry.entity';

export class TimeEntryResponseDto {
  id: string;
  type: TimeEntryType;
  timestamp: Date;
  createdAt: Date;
  user: {
    id: string;
    name: string;
  };
}