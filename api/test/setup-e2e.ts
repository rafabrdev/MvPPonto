import { DataSource } from 'typeorm';

// Configuração do banco de testes
export const testDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'mvpponto_test',
  entities: ['src/**/*.entity.ts'],
  synchronize: true,
  dropSchema: true,
  logging: false,
});

// Setup global para E2E
beforeAll(async () => {
  // Conectar ao banco de testes
  if (!testDataSource.isInitialized) {
    await testDataSource.initialize();
  }
});

afterAll(async () => {
  // Fechar conexão
  if (testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
});