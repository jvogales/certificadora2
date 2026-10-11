const referenciaRepository = require('../repositories/referencia.repository');

const TIPOS_VALIDOS = ['SERIE', 'FILME', 'MUSICA', 'OUTRO'];

// valida campos obrigatórios de acordo com o tipo escolhido.
// Cada tipo tem exigências diferentes: série pede temporada/episódio,
// música pede autor/artista, filme e outro não exigem nenhum dos dois.
function validarCamposPorTipo(dados) {
  const { titulo, tipo, temporada, episodio, autorArtista } = dados;

  if (!titulo) {
    throw new ErroValidacao('Título é obrigatório');
  }

  if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
    throw new ErroValidacao(`Tipo deve ser um dos seguintes: ${TIPOS_VALIDOS.join(', ')}`);
  }

  if (tipo === 'SERIE' && (!temporada || !episodio)) {
    throw new ErroValidacao('Para séries, temporada e episódio são obrigatórios');
  }

  if (tipo === 'MUSICA' && !autorArtista) {
    throw new ErroValidacao('Para músicas, o artista/autor é obrigatório');
  }
}

async function listar(filtros) {
  return referenciaRepository.listar(filtros);
}

async function buscarPorId(refId) {
  const referencia = await referenciaRepository.buscarPorId(refId);
  if (!referencia) {
    throw new ErroNaoEncontrado('Referência audiovisual não encontrada');
  }
  return referencia;
}

async function criar(dados, monitorId) {
  validarCamposPorTipo(dados);
  return referenciaRepository.criar(dados, monitorId);
}

async function atualizar(refId, dados) {
  await buscarPorId(refId); // confirma que existe antes de tentar atualizar
  validarCamposPorTipo(dados);
  return referenciaRepository.atualizar(refId, dados);
}

async function excluir(refId) {
  await buscarPorId(refId);

  try {
    await referenciaRepository.excluir(refId);
  } catch (erro) {
    // Código 23503 = violação de chave estrangeira no PostgreSQL.
    // Acontece quando essa referência ainda está sendo usada por algum
    // conteúdo PDF (atividade ou material), já que id_ref_audio é
    // obrigatório (NOT NULL) na tabela conteudo_pdf.
    if (erro.code === '23503') {
      throw new ErroValidacao(
        'Não é possível excluir esta referência porque existem atividades ou materiais vinculados a ela'
      );
    }
    throw erro; // qualquer outro erro, deixa subir normalmente
  }
}

class ErroValidacao extends Error {}
class ErroNaoEncontrado extends Error {}

module.exports = {
  listar, buscarPorId, criar, atualizar, excluir,
  ErroValidacao, ErroNaoEncontrado,
};