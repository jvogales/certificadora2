const pool = require('../db/pool');

// listar com filtros opcionais por tipo (ATIVIDADE/MATERIAL)
// e/ou por referência audiovisual vinculada
async function listar({ tipo, refAudioId } = {}) {
  const condicoes = [];
  const valores = [];

  if (tipo) {
    valores.push(tipo);
    condicoes.push(`tipo = $${valores.length}`);
  }
  if (refAudioId) {
    valores.push(refAudioId);
    condicoes.push(`id_ref_audio = $${valores.length}`);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
  const resultado = await pool.query(
    `SELECT * FROM conteudo_pdf ${where} ORDER BY data_cadastro DESC`,
    valores
  );
  return resultado.rows;
}

async function buscarPorId(conteudoId) {
  const resultado = await pool.query(
    'SELECT * FROM conteudo_pdf WHERE conteudo_id = $1',
    [conteudoId]
  );
  return resultado.rows[0];
}


async function criar(dados, monitorId) {
  const { tipo, titulo, descricao, arquivoUrl, idRefAudio } = dados;

  const resultado = await pool.query(
    `INSERT INTO conteudo_pdf (tipo, titulo, descricao, arquivo_url, id_monitor_criador, id_ref_audio)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [tipo, titulo, descricao, arquivoUrl, monitorId, idRefAudio]
  );
  return resultado.rows[0];
}


async function atualizar(conteudoId, dados) {
  const { tipo, titulo, descricao, arquivoUrl, idRefAudio } = dados;

  const resultado = await pool.query(
    `UPDATE conteudo_pdf
     SET tipo=$1, titulo=$2, descricao=$3, arquivo_url=$4, id_ref_audio=$5
     WHERE conteudo_id = $6
     RETURNING *`,
    [tipo, titulo, descricao, arquivoUrl, idRefAudio, conteudoId]
  );
  return resultado.rows[0];
}

async function excluir(conteudoId) {
  await pool.query('DELETE FROM conteudo_pdf WHERE conteudo_id = $1', [conteudoId]);
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };