import { Pool } from 'pg';

// Configuração do pool de conexões com o PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'portal_login', // Nome do seu banco de dados
  password: '8025Agatha',
  port: 5432,
});

export default pool;
