const pool = require('../db/pool');

//  registra a conclusão de uma atividade por um aluno
async function registrar(alunoId, atividadeId) {
  const resultado = await pool.query(
    `INSERT INTO conclusao_atividade (id_aluno, id_atividade)
     VALUES ($1, $2)
     RETURNING *`,
    [alunoId, atividadeId]
  );
  return resultado.rows[0];
}

// Remove o registro de conclusão (o aluno "desmarca" a atividade)
async function remover(alunoId, atividadeId) {
  const resultado = await pool.query(
    `DELETE FROM conclusao_atividade
     WHERE id_aluno = $1 AND id_atividade = $2
     RETURNING *`,
    [alunoId, atividadeId]
  );
  return resultado.rows[0]; // undefined se não havia nada pra remover
}

// lista o histórico de conclusões de um aluno específico
async function listarPorAluno(alunoId) {
  const resultado = await pool.query(
    `SELECT c.conclusao_id, c.data_conclusao, a.conteudo_id, a.titulo
     FROM conclusao_atividade c
     JOIN conteudo_pdf a ON a.conteudo_id = c.id_atividade
     WHERE c.id_aluno = $1
     ORDER BY c.data_conclusao DESC`,
    [alunoId]
  );
  return resultado.rows;
}

// Conta quantas atividades esse aluno já concluiu
async function contarConcluidas(alunoId) {
  const resultado = await pool.query(
    'SELECT COUNT(*) FROM conclusao_atividade WHERE id_aluno = $1',
    [alunoId]
  );
  return parseInt(resultado.rows[0].count, 10);
}

// Conta o total de atividades disponíveis no sistema (não materiais)
async function contarAtividadesDisponiveis() {
  const resultado = await pool.query(
    "SELECT COUNT(*) FROM conteudo_pdf WHERE tipo = 'ATIVIDADE'"
  );
  return parseInt(resultado.rows[0].count, 10);
}

module.exports = { registrar, remover, listarPorAluno, contarConcluidas, contarAtividadesDisponiveis };