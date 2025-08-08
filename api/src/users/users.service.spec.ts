import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
    timeEntries: [],
    schedules: [],
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
      role: UserRole.USER,
    };

    it('deve criar um novo usuário', async () => {
      repository.findOne.mockResolvedValue(null); // Email não existe
      repository.create.mockReturnValue(mockUser as any);
      repository.save.mockResolvedValue(mockUser);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);

      const result = await service.create(createUserDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 12);
      expect(repository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash: 'hashedPassword',
        role: createUserDto.role,
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('deve lançar erro se email já existe', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de usuários', async () => {
      const users = [mockUser];
      repository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      });
      expect(result).toEqual(users);
    });
  });

  describe('findById', () => {
    it('deve retornar usuário por ID', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      });
      expect(result).toEqual(mockUser);
    });

    it('deve lançar erro se usuário não existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('deve retornar usuário por email', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    const updateUserDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    it('deve atualizar usuário existente', async () => {
      const findByIdSpy = jest.spyOn(service, 'findById');
      findByIdSpy.mockResolvedValueOnce(mockUser);
      findByIdSpy.mockResolvedValueOnce({ ...mockUser, ...updateUserDto });
      
      repository.findOne.mockResolvedValue(null); // Email não existe
      repository.update.mockResolvedValue(undefined as any);

      const result = await service.update('1', updateUserDto);

      expect(repository.update).toHaveBeenCalledWith('1', updateUserDto);
      expect(result).toEqual({ ...mockUser, ...updateUserDto });
    });

    it('deve lançar erro se novo email já existe', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      repository.findOne.mockResolvedValue({ ...mockUser, id: '2' }); // Outro usuário com mesmo email

      await expect(service.update('1', updateUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('deve remover usuário existente', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      repository.remove.mockResolvedValue(undefined as any);

      await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(mockUser);
    });
  });
});