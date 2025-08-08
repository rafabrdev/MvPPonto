import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TimeEntriesService } from './time-entries.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('time-entries')
@UseGuards(JwtAuthGuard)
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() createTimeEntryDto: CreateTimeEntryDto) {
    const timeEntry = await this.timeEntriesService.create(req.user, createTimeEntryDto);
    
    return {
      message: 'Ponto registrado com sucesso',
      data: {
        id: timeEntry.id,
        type: timeEntry.type,
        timestamp: timeEntry.timestamp,
      },
    };
  }

  @Get('dashboard')
  async getDashboard(@Request() req) {
    const dashboard = await this.timeEntriesService.getDashboard(req.user);
    
    return {
      message: 'Dashboard carregado com sucesso',
      data: dashboard,
    };
  }

  @Get('history')
  async getHistory(@Request() req, @Query() query: HistoryQueryDto) {
    const history = await this.timeEntriesService.getHistory(req.user, query);
    
    return {
      message: 'Histórico carregado com sucesso',
      data: history.data,
      pagination: history.pagination,
    };
  }

  // Endpoints administrativos
  @Get('admin/history')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getAdminHistory(@Query() query: HistoryQueryDto & { userId?: string }) {
    const history = await this.timeEntriesService.getAdminHistory(query);
    
    return {
      message: 'Histórico administrativo carregado com sucesso',
      data: history.data,
      pagination: history.pagination,
    };
  }
}