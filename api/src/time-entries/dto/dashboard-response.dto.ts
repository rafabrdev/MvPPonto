export class DashboardResponseDto {
  date: string;
  entries: {
    checkIn?: Date;
    lunchOut?: Date;
    lunchIn?: Date;
    checkOut?: Date;
  };
  workingHours: {
    worked: number; // em minutos
    remaining: number; // em minutos
    expectedTotal: number; // em minutos
  };
  status: 'not_started' | 'working' | 'lunch' | 'finished';
}