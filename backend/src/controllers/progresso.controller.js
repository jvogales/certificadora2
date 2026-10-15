const progressoService = require('../services/progresso.service');

// o próprio aluno marca a atividade como concluída.
// alunoId vem de req.usuario.userId (quem está logado), nunca do corpo
// da requisição - isso impede um aluno de marcar progresso de outro aluno.
async function marcarConcluida(req, res) {
  try {
    const conclusao = await progressoService.marcarConcluida(
      req.usuario.userId,
      req.params.atividadeId
    );
    return res.status(201).json(conclusao);
  } catch (erro) {
    if (erro instanceof progressoService.ErroValidacao) {
      return res.status(400).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao marcar atividade como concluída' });
  }
}

async function desmarcarConcluida(req, res) {
  try {
    await progressoService.desmarcarConcluida(req.usuario.userId, req.params.atividadeId);
    return res.status(204).send(); // sucesso, sem corpo de resposta
  } catch (erro) {
    if (erro instanceof progressoService.ErroValidacao) {
      return res.status(400).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao desmarcar atividade' });
  }
}

// o aluno consulta o próprio progresso
async function consultarProprioProgresso(req, res) {
  const progresso = await progressoService.calcularProgresso(req.usuario.userId);
  return res.status(200).json(progresso);
}

// o monitor ou admin consultam o progresso de um aluno específico
async function consultarProgressoDeAluno(req, res) {
  const progresso = await progressoService.calcularProgresso(req.params.alunoId);
  return res.status(200).json(progresso);
}

module.exports = { marcarConcluida, desmarcarConcluida, consultarProprioProgresso, consultarProgressoDeAluno };