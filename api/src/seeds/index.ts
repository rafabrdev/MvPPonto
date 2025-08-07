import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { SchedulesService } from '../schedules/schedules.service';
import { UserRole } from '../users/entities/user.entity';
import { Logger } from '@nestjs/common';

async function seed() {
  const logger = new Logger('DatabaseSeeder');
  
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    
    const usersService = app.get(UsersService);
    const schedulesService = app.get(SchedulesService);
    
    logger.log('🌱 Iniciando seeder do banco de dados...');
    
    // Criar usuários de exemplo
    const users = [
      {
        name: 'Administrador',
        email: 'admin@mvpponto.com',
        password: 'admin123',
        role: UserRole.ADMIN,
      },
      {
        name: 'João Silva',
        email: 'joao@mvpponto.com',
        password: 'user123',
        role: UserRole.USER,
      },
      {
        name: 'Maria Santos',
        email: 'maria@mvpponto.com',
        password: 'user123',
        role: UserRole.USER,
      },
      {
        name: 'Pedro Manager',
        email: 'pedro@mvpponto.com',
        password: 'manager123',
        role: UserRole.MANAGER,
      },
    ];
    
    const createdUsers: any[] = [];
    
    for (const userData of users) {
      try {
        const existingUser = await usersService.findByEmail(userData.email);
        if (!existingUser) {
          const user = await usersService.create(userData);
          createdUsers.push(user);
          logger.log(`✅ Usuário criado: ${userData.name} (${userData.email})`);
        } else {
          logger.log(`ℹ️  Usuário já existe: ${userData.email}`);
          createdUsers.push(existingUser);
        }
      } catch (error) {
        logger.error(`❌ Erro ao criar usuário ${userData.email}:`, error.message);
      }
    }
    
    // Criar expedientes de exemplo (próximos 30 dias)
    logger.log('📅 Criando expedientes de exemplo...');
    
    const today = new Date();
    const schedulePromises: any[] = [];
    
    // Criar expediente para os próximos 30 dias (apenas dias úteis)
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Pular fins de semana
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }
      
      // Criar expediente para cada usuário não-admin
      const regularUsers = createdUsers.filter(u => u.role !== UserRole.ADMIN);
      
      for (const user of regularUsers) {
        const scheduleData = {
          userId: user.id,
          date: date.toISOString().split('T')[0],
          startTime: '08:00',
          endTime: '17:00',
          lunchStart: '12:00',
          lunchEnd: '13:00',
        };
        
        schedulePromises.push(
          schedulesService.create(user, scheduleData).catch(error => {
            // Ignora erro se expediente já existe
            if (!error.message.includes('Já existe')) {
              logger.error(`❌ Erro ao criar expediente para ${user.name}:`, error.message);
            }
          })
        );
      }
    }
    
    await Promise.all(schedulePromises);
    logger.log('✅ Expedientes de exemplo criados');
    
    await app.close();
    
    logger.log('🎉 Seeder executado com sucesso!');
    logger.log('');
    logger.log('👤 Credenciais de acesso:');
    logger.log('📧 Admin: admin@mvpponto.com | 🔑 admin123');
    logger.log('📧 Manager: pedro@mvpponto.com | 🔑 manager123');
    logger.log('📧 User: joao@mvpponto.com | 🔑 user123');
    logger.log('📧 User: maria@mvpponto.com | 🔑 user123');
    
  } catch (error) {
    logger.error('❌ Erro no seeder:', error);
    process.exit(1);
  }
}

seed();