// Cria conexão com o banco de dados PostgreSQL

const { Pool } = require('pg'); // biblioteca para conectar com o PostgreSQL
require('dotenv').config(); // carrega as variáveis de ambiente do arquivo .env

const pool = new Pool({
  host: process.env.DB_HOST,        // endereço do servidor do banco de dados (localhost)
  port: process.env.DB_PORT,        // porta do servidor do banco de dados (5432)
  database: process.env.DB_NAME,    // nome do banco de dados ('talkflix')
  user: process.env.DB_USER,        // nome do usuário do banco de dados (posrtgres)
  password: process.env.DB_PASSWORD,// senha do usuário do banco de dados (.env)
});

pool.on('error', (erro) => {
  console.error('Erro inesperado no pool de conexões do PostgreSQL:', erro);
});

module.exports = pool;