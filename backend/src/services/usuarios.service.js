const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuarios.repository');

const SALT_ROUNDS = 10; // "custo" do hash 

async function cadastrar({ nome, login, senha, perfil }) {
  // Validação básica: garantir que nada essencial veio vazio
  if (!nome || !login || !senha || !perfil) {
    throw new ErroValidacao('Nome, login, senha e perfil são obrigatórios');
  }
  
  // Garantir que o perfil enviado é um dos três válidos
  if (!['ADMIN', 'MONITOR', 'ALUNO'].includes(perfil)) {
    throw new ErroValidacao('Perfil inválido');
  }

  // não permitir dois usuários com o mesmo login
  const jaExiste = await usuarioRepository.buscarPorLogin(login);
  if (jaExiste) {
    throw new ErroValidacao('Já existe um usuário com esse login');
  }

  // Aqui é o único lugar do sistema onde a senha em texto puro existe
  // antes de virar hash. Depois disso, só o hash é armazenado no banco.
  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  return usuarioRepository.criar({ nome, login, senhaHash, perfil });
}

async function listar() {
  return usuarioRepository.listar();
}

// remoção pelo administrador
async function remover(userId) {
  const usuario = await usuarioRepository.buscarPorId(userId);
  if (!usuario) {
    throw new ErroNaoEncontrado('Usuário não encontrado');
  }
  return usuarioRepository.inativar(userId);
}

class ErroValidacao extends Error {}
class ErroNaoEncontrado extends Error {}

module.exports = { cadastrar, listar, remover, ErroValidacao, ErroNaoEncontrado };