const conteudoRepository = require('../repositories/conteudo.repository');
const referenciaRepository = require('../repositories/referencia.repository');

const TIPOS_VALIDOS = ['ATIVIDADE', 'MATERIAL'];

async function validarDados({ tipo, titulo, arquivoUrl, idRefAudio }) {
  if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
    throw new ErroValidacao(`Tipo deve ser um dos seguintes: ${TIPOS_VALIDOS.join(', ')}`);
  }
  if (!titulo) {
    throw new ErroValidacao('Título é obrigatório');
  }
  if (!arquivoUrl) {
    throw new ErroValidacao('O caminho/link do arquivo PDF é obrigatório');
  }
  if (!idRefAudio) {
    throw new ErroValidacao('Todo conteúdo deve estar vinculado a uma referência audiovisual');
  }

  // Confirma que a referência realmente existe, antes de deixar o banco
  // recusar via foreign key - dá uma mensagem de erro bem mais clara
  const referencia = await referenciaRepository.buscarPorId(idRefAudio);
  if (!referencia) {
    throw new ErroValidacao('A referência audiovisual informada não existe');
  }
}

async function listar(filtros) {
  return conteudoRepository.listar(filtros);
}

async function buscarPorId(conteudoId) {
  const conteudo = await conteudoRepository.buscarPorId(conteudoId);
  if (!conteudo) {
    throw new ErroNaoEncontrado('Conteúdo não encontrado');
  }
  return conteudo;
}

async function criar(dados, monitorId) {
  await validarDados(dados);
  return conteudoRepository.criar(dados, monitorId);
}

async function atualizar(conteudoId, dados) {
  await buscarPorId(conteudoId);
  await validarDados(dados);
  return conteudoRepository.atualizar(conteudoId, dados);
}

async function excluir(conteudoId) {
  await buscarPorId(conteudoId);

  try {
    await conteudoRepository.excluir(conteudoId);
  } catch (erro) {
    // Mesmo padrão do módulo de referências: se esse conteúdo já tiver
    // conclusões registradas (tabela conclusao_atividade), o banco
    // recusa a exclusão por integridade referencial.
    if (erro.code === '23503') {
      throw new ErroValidacao(
        'Não é possível excluir este conteúdo porque existem conclusões de atividade vinculadas a ele'
      );
    }
    throw erro;
  }
}

class ErroValidacao extends Error {}
class ErroNaoEncontrado extends Error {}

module.exports = {
  listar, buscarPorId, criar, atualizar, excluir,
  ErroValidacao, ErroNaoEncontrado,
};