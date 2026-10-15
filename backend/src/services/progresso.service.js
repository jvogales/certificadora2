const conclusaoRepository = require('../repositories/conclusao.repository');
const conteudoRepository = require('../repositories/conteudo.repository');

// marca uma atividade como concluída pelo aluno
async function marcarConcluida(alunoId, atividadeId) {
  // Confirma que o conteúdo existe
  const conteudo = await conteudoRepository.buscarPorId(atividadeId);
  if (!conteudo) {
    throw new ErroValidacao('Atividade não encontrada');
  }

  //  só atividade pode ser marcada como concluída
  if (conteudo.tipo !== 'ATIVIDADE') {
    throw new ErroValidacao('Apenas atividades podem ser marcadas como concluídas, não materiais de aula');
  }

  try {
    return await conclusaoRepository.registrar(alunoId, atividadeId);
  } catch (erro) {
    // código 23505 = violação de UNIQUE no PostgreSQL.
    // Acontece se o aluno tentar marcar a mesma atividade duas vezes,
    // já que a tabela tem UNIQUE (id_aluno, id_atividade).
    if (erro.code === '23505') {
      throw new ErroValidacao('Esta atividade já foi marcada como concluída por você');
    }
    throw erro;
  }
}

// Desmarca uma atividade que o aluno havia marcado por engano
async function desmarcarConcluida(alunoId, atividadeId) {
  const removido = await conclusaoRepository.remover(alunoId, atividadeId);

  if (!removido) {
    // Não havia conclusão registrada pra esse aluno+atividade
    throw new ErroValidacao('Esta atividade não estava marcada como concluída');
  }

  return removido;
}

// calcula o percentual de progresso de um aluno
async function calcularProgresso(alunoId) {
  const concluidas = await conclusaoRepository.contarConcluidas(alunoId);
  const disponiveis = await conclusaoRepository.contarAtividadesDisponiveis();

  // Evita divisão por zero, caso ainda não exista nenhuma atividade cadastrada
  const percentual = disponiveis > 0
    ? Math.round((concluidas / disponiveis) * 100 * 10) / 10 // arredonda para 1 casa decimal
    : 0;

  const historico = await conclusaoRepository.listarPorAluno(alunoId);

  return {
    atividadesConcluidas: concluidas,
    atividadesDisponiveis: disponiveis,
    percentual,
    historico,
  };
}

class ErroValidacao extends Error {}

module.exports = { marcarConcluida, desmarcarConcluida, calcularProgresso, ErroValidacao };