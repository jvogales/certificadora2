const interessadosService = require('../services/interessados.service');

async function cadastrar(req, res) {
  const { email, nome, matricula } = req.body;

  try {
    const interessado = await interessadosService.cadastrar({ email, nome, matricula });
    return res.status(201).json(interessado);
  } catch (erro) {
    if (erro instanceof interessadosService.ErroValidacao) {
      return res.status(400).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao cadastrar interessado' });
  }
}

module.exports = { cadastrar };