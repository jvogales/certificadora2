const conteudosService = require('../services/conteudos.service');

// filtros via query 
async function listar(req, res) {
  const { tipo, refAudioId } = req.query;
  const conteudos = await conteudosService.listar({ tipo, refAudioId });
  return res.status(200).json(conteudos);
}

async function buscarPorId(req, res) {
  try {
    const conteudo = await conteudosService.buscarPorId(req.params.id);
    return res.status(200).json(conteudo);
  } catch (erro) {
    if (erro instanceof conteudosService.ErroNaoEncontrado) {
      return res.status(404).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao buscar conteúdo' });
  }
}

async function criar(req, res) {
  try {
    const novoConteudo = await conteudosService.criar(req.body, req.usuario.userId);
    return res.status(201).json(novoConteudo);
  } catch (erro) {
    if (erro instanceof conteudosService.ErroValidacao) {
      return res.status(400).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao criar conteúdo' });
  }
}

async function atualizar(req, res) {
  try {
    const atualizado = await conteudosService.atualizar(req.params.id, req.body);
    return res.status(200).json(atualizado);
  } catch (erro) {
    if (erro instanceof conteudosService.ErroNaoEncontrado) {
      return res.status(404).json({ erro: erro.message });
    }
    if (erro instanceof conteudosService.ErroValidacao) {
      return res.status(400).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao atualizar conteúdo' });
  }
}

async function excluir(req, res) {
  try {
    await conteudosService.excluir(req.params.id);
    return res.status(204).send();
  } catch (erro) {
    if (erro instanceof conteudosService.ErroNaoEncontrado) {
      return res.status(404).json({ erro: erro.message });
    }
    if (erro instanceof conteudosService.ErroValidacao) {
      return res.status(400).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao excluir conteúdo' });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };