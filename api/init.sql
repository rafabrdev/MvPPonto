-- Configurações iniciais do banco
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Garantir que o banco mvpponto existe
-- (já é criado pelo POSTGRES_DB, mas garantindo)
SELECT 'CREATE DATABASE mvpponto'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mvpponto');