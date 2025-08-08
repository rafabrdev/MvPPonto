import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Endpoint público para o usuário atual
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    
    return {
      message: 'Perfil carregado com sucesso',
      data: user,
    };
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    // Usuário comum não pode alterar role
    const { role, ...updateData } = updateUserDto;
    
    const user = await this.usersService.update(req.user.id, updateData);
    
    return {
      message: 'Perfil atualizado com sucesso',
      data: user,
    };
  }

  // Endpoints administrativos
  @Post('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    
    return {
      message: 'Usuário criado com sucesso',
      data: user,
    };
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findAll(
    @Query('role') role?: UserRole,
    @Query('search') search?: string,
  ) {
    let users = await this.usersService.findAll();
    
    // Filtro por role
    if (role) {
      users = users.filter(user => user.role === role);
    }
    
    // Busca por nome ou email
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    return {
      message: 'Usuários carregados com sucesso',
      data: users,
      total: users.length,
    };
  }

  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    
    return {
      message: 'Usuário carregado com sucesso',
      data: user,
    };
  }

  @Put('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    
    return {
      message: 'Usuário atualizado com sucesso',
      data: user,
    };
  }

  @Delete('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    // Impedir que o admin delete a si mesmo
    if (id === req.user.id) {
      throw new BadRequestException('Não é possível deletar sua própria conta');
    }
    
    await this.usersService.remove(id);
  }

  @Get('admin/stats/roles')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getRoleStats() {
    const users = await this.usersService.findAll();
    
    const stats = {
      total: users.length,
      byRole: {
        admin: users.filter(u => u.role === UserRole.ADMIN).length,
        manager: users.filter(u => u.role === UserRole.MANAGER).length,
        user: users.filter(u => u.role === UserRole.USER).length,
      },
    };
    
    return {
      message: 'Estatísticas carregadas com sucesso',
      data: stats,
    };
  }
}

// Adicionar import para BadRequestException
import { BadRequestException } from '@nestjs/common';