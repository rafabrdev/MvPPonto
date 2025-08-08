import { ConfigService } from '@nestjs/config';

// Mock do ConfigService para testes
const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: any) => {
    const config = {
      DATABASE_HOST: 'localhost',
      DATABASE_PORT: 5432,
      DATABASE_USERNAME: 'test',
      DATABASE_PASSWORD: 'test',
      DATABASE_NAME: 'mvpponto_test',
      JWT_SECRET: 'test-secret-key',
      JWT_EXPIRES_IN: '1h',
      JWT_REFRESH_EXPIRES_IN: '7d',
      NODE_ENV: 'test',
    };
    return config[key] || defaultValue;
  }),
};

// Configurações globais para testes
jest.setTimeout(30000);

// Mock global do ConfigService
jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn(() => mockConfigService),
  ConfigModule: {
    forRoot: jest.fn(() => ({})),
  },
}));