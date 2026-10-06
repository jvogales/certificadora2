const pool = require('../db/pool');

// verifica se o e-mail já está cadastrado, antes de inserir
async function buscarPorEmail(email) {
  const resultado = await pool.query(
    'SELECT * FROM interessados WHERE email = $1',
    [email]
  );
  return resultado.rows[0];
}

async function criar({ email, nome, matricula }) {
  const resultado = await pool.query(
    `INSERT INTO interessados (email, nome, matricula)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [email, nome || null, matricula || null]
  );
  return resultado.rows[0];
}

module.exports = { buscarPorEmail, criar };