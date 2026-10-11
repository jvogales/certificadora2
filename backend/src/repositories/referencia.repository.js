const pool = require('../db/pool');

// busca e filtragem. Os filtros são opcionais: se o controller não
// mandar 'tipo' ou 'ano', a query simplesmente ignora aquele filtro.
async function listar({ tipo, ano } = {}) {
  const condicoes = [];
  const valores = [];

  // query construidda aos poucos, porque não sabemos de antemão quantos
  // filtros vão ser aplicados. Cada filtro adicionado empurra um novo
  // placeholder ($1, $2...) e seu valor correspondente.
  if (tipo) {
    valores.push(tipo);
    condicoes.push(`tipo = $${valores.length}`);
  }
  if (ano) {
    valores.push(ano);
    condicoes.push(`ano = $${valores.length}`);
  }

  // Se não houver nenhum filtro, 'where' fica vazio e a query retorna tudo
  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  const resultado = await pool.query(
    `SELECT * FROM referencia_audiovisual ${where} ORDER BY titulo`,
    valores
  );
  return resultado.rows;
}

async function buscarPorId(refId) {
  const resultado = await pool.query(
    'SELECT * FROM referencia_audiovisual WHERE ref_id = $1',
    [refId]
  );
  return resultado.rows[0];
}

// qualquer monitor autenticado pode cadastrar. monitorId vem de 
// req.usuario.userId (preenchido pelo auth.middleware),

async function criar(dados, monitorId) {
  const {
    titulo, tipo, ano, trecho, autorArtista,
    temporada, episodio, plataformaFonte, linkFonte, descricao,
  } = dados;

  const resultado = await pool.query(
    `INSERT INTO referencia_audiovisual
      (titulo, tipo, ano, trecho, autor_artista, temporada, episodio,
       plataforma_fonte, link_fonte, descricao, id_monitor)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [titulo, tipo, ano, trecho, autorArtista, temporada, episodio,
      plataformaFonte, linkFonte, descricao, monitorId]
  );
  return resultado.rows[0];
}

// qualquer monitor pode editar, não só quem criou. 
async function atualizar(refId, dados) {
  const {
    titulo, tipo, ano, trecho, autorArtista,
    temporada, episodio, plataformaFonte, linkFonte, descricao,
  } = dados;

  const resultado = await pool.query(
    `UPDATE referencia_audiovisual
     SET titulo=$1, tipo=$2, ano=$3, trecho=$4, autor_artista=$5,
         temporada=$6, episodio=$7, plataforma_fonte=$8, link_fonte=$9, descricao=$10
     WHERE ref_id = $11
     RETURNING *`,
    [titulo, tipo, ano, trecho, autorArtista, temporada, episodio,
      plataformaFonte, linkFonte, descricao, refId]
  );
  return resultado.rows[0];
}

async function excluir(refId) {
  await pool.query('DELETE FROM referencia_audiovisual WHERE ref_id = $1', [refId]);
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };