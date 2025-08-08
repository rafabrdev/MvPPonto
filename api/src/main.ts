import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
// import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
// import { CustomValidationPipe } from './common/pipes/validation.pipe';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);
    
    // Trust proxy (importante para rate limiting e logs)
    app.set('trust proxy', 1);
    
    // Segurança - Helmet
    app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }));
    
    // CORS
    const corsOrigin = configService.get<string>('CORS_ORIGIN');
    app.enableCors({
      origin: corsOrigin ? corsOrigin.split(',') : ['http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });
    
    // Global Prefix
    app.setGlobalPrefix('api/v1');
    
    // Pipes de validação
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
        validationError: {
          target: false,
          value: false,
        },
      }),
    );
    
    // Global Exception Filter
    // app.useGlobalFilters(new GlobalExceptionFilter());
    
    // Body size limit
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Health check endpoint
    app.use('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: configService.get('NODE_ENV'),
      });
    });
    
    const port = configService.get<number>('PORT', 3000);
    
    await app.listen(port, '0.0.0.0');
    
    logger.log(`🚀 Aplicação rodando na porta ${port}`);
    logger.log(`📊 Health check: http://localhost:${port}/health`);
    logger.log(`🔗 API Base URL: http://localhost:${port}/api/v1`);
    logger.log(`🌍 Ambiente: ${configService.get('NODE_ENV', 'development')}`);
    
    // Criar usuário admin padrão se não existir
    const { UsersService } = await import('./users/users.service');
    const usersService = app.get(UsersService);
    await usersService.createDefaultAdmin();
    logger.log('✅ Usuário administrador verificado/criado');
    
  } catch (error) {
    logger.error('❌ Erro ao inicializar aplicação:', error);
    process.exit(1);
  }
}

import * as express from 'express';

bootstrap();