import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { User } from '../users/entities/user.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { BulkScheduleDto } from './dto/bulk-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(user: User, createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const { date, startTime, endTime, lunchStart, lunchEnd } = createScheduleDto;
    
    // Validar horários
    this.validateTimeFormat(startTime, endTime, lunchStart, lunchEnd);
    
    // Verificar se já existe expediente para esta data
    const existingSchedule = await this.schedulesRepository.findOne({
      where: {
        userId: user.id,
        date: new Date(date),
      },
    });

    if (existingSchedule) {
      throw new ConflictException('Já existe um expediente cadastrado para esta data');
    }

    const schedule = this.schedulesRepository.create({
      userId: user.id,
      date: new Date(date),
      startTime,
      endTime,
      lunchStart,
      lunchEnd,
    });

    return this.schedulesRepository.save(schedule);
  }

  async findUserSchedules(userId: string, startDate?: string, endDate?: string) {
    const whereCondition: any = { userId };

    if (startDate && endDate) {
      whereCondition.date = Between(new Date(startDate), new Date(endDate));
    }

    return this.schedulesRepository.find({
      where: whereCondition,
      order: { date: 'DESC' },
      relations: ['user'],
    });
  }

  async findById(id: string): Promise<Schedule> {
    const schedule = await this.schedulesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!schedule) {
      throw new NotFoundException('Expediente não encontrado');
    }

    return schedule;
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule> {
    const schedule = await this.findById(id);
    
    // Validar novos horários
    const { startTime, endTime, lunchStart, lunchEnd } = updateScheduleDto;
    if (startTime || endTime || lunchStart || lunchEnd) {
      this.validateTimeFormat(
        startTime || schedule.startTime,
        endTime || schedule.endTime,
        lunchStart !== undefined ? lunchStart : schedule.lunchStart,
        lunchEnd !== undefined ? lunchEnd : schedule.lunchEnd,
      );
    }

    await this.schedulesRepository.update(id, updateScheduleDto);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const schedule = await this.findById(id);
    await this.schedulesRepository.remove(schedule);
  }

  // Métodos administrativos
  async findAll(startDate?: string, endDate?: string) {
    const whereCondition: any = {};

    if (startDate && endDate) {
      whereCondition.date = Between(new Date(startDate), new Date(endDate));
    }

    return this.schedulesRepository.find({
      where: whereCondition,
      order: { date: 'DESC', createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async createBulkSchedules(bulkScheduleDto: BulkScheduleDto): Promise<Schedule[]> {
    const { schedules } = bulkScheduleDto;
    const createdSchedules: Schedule[] = [];

    // Validar se todos os usuários existem
    const userIds = [...new Set(schedules.map(s => s.userId))];
    const users = await this.usersRepository.findByIds(userIds);
    
    if (users.length !== userIds.length) {
      throw new BadRequestException('Um ou mais usuários não foram encontrados');
    }

    // Processar cada expediente
    for (const scheduleData of schedules) {
      const { userId, date, startTime, endTime, lunchStart, lunchEnd } = scheduleData;
      
      // Validar horários
      this.validateTimeFormat(startTime, endTime, lunchStart, lunchEnd);
      
      // Verificar se já existe
      const existing = await this.schedulesRepository.findOne({
        where: {
          userId,
          date: new Date(date),
        },
      });

      if (!existing) {
        const schedule = this.schedulesRepository.create({
          userId,
          date: new Date(date),
          startTime,
          endTime,
          lunchStart,
          lunchEnd,
        });
        
        const saved = await this.schedulesRepository.save(schedule);
        createdSchedules.push(saved);
      }
    }

    return createdSchedules;
  }

  async getDefaultSchedule(): Promise<Partial<CreateScheduleDto>> {
    return {
      startTime: '08:00',
      endTime: '17:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
    };
  }

  private validateTimeFormat(
    startTime: string,
    endTime: string,
    lunchStart?: string,
    lunchEnd?: string,
  ): void {
    // Converter para minutos para facilitar comparação
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      throw new BadRequestException('Horário de início deve ser anterior ao de fim');
    }

    if (lunchStart && lunchEnd) {
      const lunchStartMinutes = this.timeToMinutes(lunchStart);
      const lunchEndMinutes = this.timeToMinutes(lunchEnd);

      if (lunchStartMinutes >= lunchEndMinutes) {
        throw new BadRequestException('Horário de saída para almoço deve ser anterior ao de retorno');
      }

      if (lunchStartMinutes <= startMinutes || lunchEndMinutes >= endMinutes) {
        throw new BadRequestException('Horário de almoço deve estar dentro do expediente');
      }
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}