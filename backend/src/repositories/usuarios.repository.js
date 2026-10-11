const pool = require('../db/pool');

// busca usuário pelo login (para autenticação)
// AND ativo = TRUE garante que apenas usuários ativos podem logar

async function buscarPorLogin(login) {
  const resultado = await pool.query(
    'SELECT * FROM usuario WHERE login = $1 AND ativo = TRUE',
    [login]
  );
  return resultado.rows[0];
}

// busca usuário pelo ID (para exibir dados do perfil)
async function buscarPorId(userId) {
  const resultado = await pool.query(
    'SELECT user_id, nome, login, perfil, ativo, data_cadastro FROM usuario WHERE user_id = $1',
    [userId]
  );
  return resultado.rows[0];
}

// lista todos os usuários (para administração)
async function listar() {
  const resultado = await pool.query(
    'SELECT user_id, nome, login, perfil, ativo, data_cadastro FROM usuario ORDER BY nome'
  );
  return resultado.rows;
}

// cadastro de aluno/monitor pelo administrador com a senha já criptografada (hash)
async function criar({ nome, login, senhaHash, perfil }) {
  const resultado = await pool.query(
    `INSERT INTO usuario (nome, login, senha, perfil)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, nome, login, perfil, ativo, data_cadastro`,
    [nome, login, senhaHash, perfil]
  );
  return resultado.rows[0];
}

// remoção de usuário via soft delete (mantém histórico no banco)
async function inativar(userId) {
  const resultado = await pool.query(
    'UPDATE usuario SET ativo = FALSE WHERE user_id = $1 RETURNING user_id, ativo',
    [userId]
  );
  return resultado.rows[0];
}

module.exports = { buscarPorLogin, buscarPorId, listar, criar, inativar };