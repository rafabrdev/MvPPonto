import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { BulkScheduleDto } from './dto/bulk-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  // Endpoints do usuário
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() createScheduleDto: CreateScheduleDto) {
    const schedule = await this.schedulesService.create(req.user, createScheduleDto);
    
    return {
      message: 'Expediente criado com sucesso',
      data: schedule,
    };
  }

  @Get()
  async findUserSchedules(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const schedules = await this.schedulesService.findUserSchedules(
      req.user.id,
      startDate,
      endDate,
    );
    
    return {
      message: 'Expedientes carregados com sucesso',
      data: schedules,
    };
  }

  @Get('default')
  async getDefaultSchedule() {
    const defaultSchedule = await this.schedulesService.getDefaultSchedule();
    
    return {
      message: 'Expediente padrão carregado com sucesso',
      data: defaultSchedule,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const schedule = await this.schedulesService.findById(id);
    
    return {
      message: 'Expediente carregado com sucesso',
      data: schedule,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    const schedule = await this.schedulesService.update(id, updateScheduleDto);
    
    return {
      message: 'Expediente atualizado com sucesso',
      data: schedule,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.schedulesService.remove(id);
  }

  // Endpoints administrativos
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const schedules = await this.schedulesService.findAll(startDate, endDate);
    
    return {
      message: 'Todos os expedientes carregados com sucesso',
      data: schedules,
    };
  }

  @Get('admin/user/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findUserSchedulesAdmin(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const schedules = await this.schedulesService.findUserSchedules(
      userId,
      startDate,
      endDate,
    );
    
    return {
      message: 'Expedientes do usuário carregados com sucesso',
      data: schedules,
    };
  }

  @Post('admin/bulk')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  async createBulkSchedules(@Body() bulkScheduleDto: BulkScheduleDto) {
    const schedules = await this.schedulesService.createBulkSchedules(bulkScheduleDto);
    
    return {
      message: `${schedules.length} expedientes criados com sucesso`,
      data: schedules,
    };
  }
}