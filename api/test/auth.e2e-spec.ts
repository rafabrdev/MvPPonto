import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UsersService } from '../src/users/users.service';
import { UserRole } from '../src/users/entities/user.entity';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;

  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: UserRole.USER,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    usersService = moduleFixture.get<UsersService>(UsersService);
    
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api/v1');
    
    await app.init();

    // Criar usuário para testes
    try {
      await usersService.create(testUser);
    } catch (error) {
      // Usuário pode já existir de teste anterior
    }
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('deve fazer login com credenciais válidas', async () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
        });
    });

    it('deve retornar erro 401 com credenciais inválidas', async () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'senhaErrada',
        })
        .expect(401);
    });

    it('deve retornar erro 400 com dados inválidos', async () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'email-invalido',
          password: '123', // Muito curta
        })
        .expect(400);
    });
  });

  describe('/auth/me (GET)', () => {
    it('deve retornar perfil do usuário autenticado', async () => {
      // Primeiro fazer login
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      const { accessToken } = loginResponse.body;

      // Então acessar perfil
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.name).toBe(testUser.name);
        });
    });

    it('deve retornar erro 401 sem token', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('deve renovar token válido', async () => {
      // Primeiro fazer login
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const { refreshToken } = loginResponse.body;

      // Renovar token
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('deve retornar erro 401 com token inválido', async () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'token-invalido' })
        .expect(401);
    });
  });
});