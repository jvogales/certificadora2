const usuariosService = require('../services/usuarios.service');

async function cadastrar(req, res) {
  const { nome, login, senha, perfil } = req.body;

  try {
    const usuario = await usuariosService.cadastrar({ nome, login, senha, perfil });
    return res.status(201).json(usuario);
  } catch (erro) {
    if (erro instanceof usuariosService.ErroValidacao) {
      return res.status(400).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao cadastrar usuário' });
  }
}

async function listar(req, res) {
  const usuarios = await usuariosService.listar();
  return res.status(200).json(usuarios);
}

async function remover(req, res) {
  try {
    const resultado = await usuariosService.remover(req.params.id);
    return res.status(200).json(resultado);
  } catch (erro) {
    if (erro instanceof usuariosService.ErroNaoEncontrado) {
      return res.status(404).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao remover usuário' });
  }
}

module.exports = { cadastrar, listar, remover };