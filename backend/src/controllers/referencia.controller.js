const referenciasService = require('../services/referencia.service');

// filtros chegam como query string: /api/referencias?tipo=SERIE&ano=1994
async function listar(req, res) {
  const { tipo, ano } = req.query;
  const referencias = await referenciasService.listar({ tipo, ano });
  return res.status(200).json(referencias);
}

async function buscarPorId(req, res) {
  try {
    const referencia = await referenciasService.buscarPorId(req.params.id);
    return res.status(200).json(referencia);
  } catch (erro) {
    if (erro instanceof referenciasService.ErroNaoEncontrado) {
      return res.status(404).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao buscar referência' });
  }
}

async function criar(req, res) {
  try {
    // req.usuario.userId vem do auth.middleware - é o monitor logado,
    // não algo que o cliente possa manipular enviando no corpo da requisição
    const novaReferencia = await referenciasService.criar(req.body, req.usuario.userId);
    return res.status(201).json(novaReferencia);
  } catch (erro) {
    if (erro instanceof referenciasService.ErroValidacao) {
      return res.status(400).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao criar referência' });
  }
}

async function atualizar(req, res) {
  try {
    const atualizada = await referenciasService.atualizar(req.params.id, req.body);
    return res.status(200).json(atualizada);
  } catch (erro) {
    if (erro instanceof referenciasService.ErroNaoEncontrado) {
      return res.status(404).json({ erro: erro.message });
    }
    if (erro instanceof referenciasService.ErroValidacao) {
      return res.status(400).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao atualizar referência' });
  }
}

async function excluir(req, res) {
  try {
    await referenciasService.excluir(req.params.id);
    return res.status(204).send();
  } catch (erro) {
    if (erro instanceof referenciasService.ErroNaoEncontrado) {
      return res.status(404).json({ erro: erro.message });
    }
    if (erro instanceof referenciasService.ErroValidacao) {
      return res.status(400).json({ erro: erro.message }); // agora trata esse caso
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao excluir referência' });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };