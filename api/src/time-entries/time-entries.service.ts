import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TimeEntry, TimeEntryType } from './entities/time-entry.entity';
import { User } from '../users/entities/user.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { HistoryQueryDto } from './dto/history-query.dto';

@Injectable()
export class TimeEntriesService {
  constructor(
    @InjectRepository(TimeEntry)
    private timeEntriesRepository: Repository<TimeEntry>,
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
  ) {}

  async create(user: User, createTimeEntryDto: CreateTimeEntryDto): Promise<TimeEntry> {
    const { type } = createTimeEntryDto;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar registros do dia
    const todayEntries = await this.timeEntriesRepository.find({
      where: {
        userId: user.id,
        timestamp: Between(today, tomorrow),
      },
      order: { timestamp: 'ASC' },
    });

    // Validar sequência lógica
    await this.validateTimeEntrySequence(todayEntries, type);

    // Criar registro com timestamp do servidor
    const timeEntry = this.timeEntriesRepository.create({
      userId: user.id,
      type,
      timestamp: new Date(), // Sempre timestamp do servidor
    });

    return this.timeEntriesRepository.save(timeEntry);
  }

  async getDashboard(user: User): Promise<DashboardResponseDto> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar registros do dia
    const entries = await this.timeEntriesRepository.find({
      where: {
        userId: user.id,
        timestamp: Between(today, tomorrow),
      },
      order: { timestamp: 'ASC' },
    });

    // Buscar expediente do usuário para o dia
    const schedule = await this.schedulesRepository.findOne({
      where: {
        userId: user.id,
        date: today,
      },
    });

    // Organizar entradas por tipo
    const entryMap = {
      checkIn: entries.find(e => e.type === TimeEntryType.IN)?.timestamp,
      lunchOut: entries.find(e => e.type === TimeEntryType.LUNCH_OUT)?.timestamp,
      lunchIn: entries.find(e => e.type === TimeEntryType.LUNCH_IN)?.timestamp,
      checkOut: entries.find(e => e.type === TimeEntryType.OUT)?.timestamp,
    };

    // Calcular horas trabalhadas
    const workingHours = this.calculateWorkingHours(entryMap, schedule);

    // Determinar status atual
    const status = this.determineWorkStatus(entryMap);

    return {
      date: dateStr,
      entries: entryMap,
      workingHours,
      status,
    };
  }

  async getHistory(user: User, query: HistoryQueryDto) {
    const { startDate, endDate, page = 1, limit = 10 } = query;
    
    let start = new Date();
    let end = new Date();

    if (startDate) {
      start = new Date(startDate);
    } else {
      // Padrão: última semana
      start.setDate(start.getDate() - 7);
    }

    if (endDate) {
      end = new Date(endDate);
    }

    // Ajustar para incluir todo o dia
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const [entries, total] = await this.timeEntriesRepository.findAndCount({
      where: {
        userId: user.id,
        timestamp: Between(start, end),
      },
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });

    // Agrupar por data
    const groupedByDate = this.groupEntriesByDate(entries);

    return {
      data: groupedByDate,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAdminHistory(query: HistoryQueryDto & { userId?: string }) {
    const { startDate, endDate, userId, page = 1, limit = 10 } = query;
    
    let start = new Date();
    let end = new Date();

    if (startDate) {
      start = new Date(startDate);
    } else {
      start.setDate(start.getDate() - 7);
    }

    if (endDate) {
      end = new Date(endDate);
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const whereCondition: any = {
      timestamp: Between(start, end),
    };

    if (userId) {
      whereCondition.userId = userId;
    }

    const [entries, total] = await this.timeEntriesRepository.findAndCount({
      where: whereCondition,
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });

    const groupedByDate = this.groupEntriesByDate(entries);

    return {
      data: groupedByDate,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async validateTimeEntrySequence(
    existingEntries: TimeEntry[],
    newType: TimeEntryType,
  ): Promise<void> {
    const lastEntry = existingEntries[existingEntries.length - 1];

    // Regras de sequência
    const validTransitions = {
      [TimeEntryType.IN]: [TimeEntryType.LUNCH_OUT, TimeEntryType.OUT],
      [TimeEntryType.LUNCH_OUT]: [TimeEntryType.LUNCH_IN],
      [TimeEntryType.LUNCH_IN]: [TimeEntryType.LUNCH_OUT, TimeEntryType.OUT],
      [TimeEntryType.OUT]: [TimeEntryType.IN], // Próximo dia
    };

    // Se não há entradas, só aceita IN
    if (!lastEntry) {
      if (newType !== TimeEntryType.IN) {
        throw new BadRequestException('Primeiro registro do dia deve ser entrada');
      }
      return;
    }

    // Verificar se a transição é válida
    const allowedNext = validTransitions[lastEntry.type] || [];
    if (!allowedNext.includes(newType)) {
      throw new BadRequestException(
        `Transição inválida: ${lastEntry.type} -> ${newType}`,
      );
    }

    // Verificar se já foi finalizado o dia
    if (lastEntry.type === TimeEntryType.OUT) {
      throw new BadRequestException('Jornada já foi finalizada hoje');
    }
  }

  private calculateWorkingHours(
    entries: any,
    schedule?: Schedule | null,
  ): DashboardResponseDto['workingHours'] {
    let workedMinutes = 0;
    const now = new Date();

    // Calcular tempo trabalhado
    if (entries.checkIn) {
      const checkInTime = new Date(entries.checkIn);
      let workEndTime = entries.checkOut ? new Date(entries.checkOut) : now;

      // Subtrair tempo de almoço se aplicável
      if (entries.lunchOut) {
        const lunchOutTime = new Date(entries.lunchOut);
        const lunchInTime = entries.lunchIn ? new Date(entries.lunchIn) : now;
        
        // Tempo antes do almoço
        workedMinutes += Math.max(0, (lunchOutTime.getTime() - checkInTime.getTime()) / 60000);
        
        // Tempo depois do almoço (se voltou)
        if (entries.lunchIn) {
          workedMinutes += Math.max(0, (workEndTime.getTime() - lunchInTime.getTime()) / 60000);
        }
      } else {
        // Sem almoço registrado
        workedMinutes = Math.max(0, (workEndTime.getTime() - checkInTime.getTime()) / 60000);
      }
    }

    // Jornada esperada (padrão: 8h = 480min)
    let expectedTotal = 480;
    if (schedule) {
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      expectedTotal = (endHour * 60 + endMin) - (startHour * 60 + startMin);
      
      // Subtrair tempo de almoço se definido
      if (schedule.lunchStart && schedule.lunchEnd) {
        const [lunchStartH, lunchStartM] = schedule.lunchStart.split(':').map(Number);
        const [lunchEndH, lunchEndM] = schedule.lunchEnd.split(':').map(Number);
        const lunchDuration = (lunchEndH * 60 + lunchEndM) - (lunchStartH * 60 + lunchStartM);
        expectedTotal -= lunchDuration;
      }
    }

    const remaining = Math.max(0, expectedTotal - workedMinutes);

    return {
      worked: Math.round(workedMinutes),
      remaining: Math.round(remaining),
      expectedTotal,
    };
  }

  private determineWorkStatus(entries: any): DashboardResponseDto['status'] {
    if (!entries.checkIn) return 'not_started';
    if (entries.checkOut) return 'finished';
    if (entries.lunchOut && !entries.lunchIn) return 'lunch';
    return 'working';
  }

  private groupEntriesByDate(entries: TimeEntry[]) {
    const grouped = {};
    
    entries.forEach(entry => {
      const date = entry.timestamp.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(entry);
    });

    return Object.keys(grouped)
      .sort((a, b) => b.localeCompare(a))
      .map(date => ({
        date,
        entries: grouped[date],
      }));
  }
}