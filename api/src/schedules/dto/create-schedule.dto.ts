import { IsDateString, IsString, IsOptional, Matches } from 'class-validator';

export class CreateScheduleDto {
  @IsDateString()
  date: string;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime deve estar no formato HH:mm',
  })
  startTime: string;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime deve estar no formato HH:mm',
  })
  endTime: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'lunchStart deve estar no formato HH:mm',
  })
  lunchStart?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'lunchEnd deve estar no formato HH:mm',
  })
  lunchEnd?: string;
}