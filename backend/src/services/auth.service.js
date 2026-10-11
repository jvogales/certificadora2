const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuarios.repository');

// autenticação de usuários previamente cadastrados
async function autenticar(login, senha) {
  const usuario = await usuarioRepository.buscarPorLogin(login);

  if (!usuario) {
    throw new ErroAutenticacao('Login ou senha inválidos');
  }

  // bcrypt.compare pega a senha que a pessoa digitou agora e verifica se,
  // aplicando o mesmo processo de hash, ela bate com o hash salvo no
  // banco. Ele NUNCA "descriptografa" o hash de volta para texto puro -
  // hash é uma via de mão única, só dá para comparar, não reverter.

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
  if (!senhaCorreta) {
    throw new ErroAutenticacao('Login ou senha inválidos');
  }

  // Se chegou até aqui, login e senha estão certos. Agora é gerado um
  // "crachá digital" que prova, nas próximas requisições,
  // que esse usuário já se autenticou - sem precisar mandar login/senha
  // de novo a cada clique.
  const token = jwt.sign(
    { userId: usuario.user_id, perfil: usuario.perfil }, // dados guardados no token
    process.env.JWT_SECRET, // segredo usado para assinar o token
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' } // tempo de validade do token
  );

  return {
    token,
    usuario: {
      userId: usuario.user_id,
      nome: usuario.nome,
      perfil: usuario.perfil,
    },
  };
}

class ErroAutenticacao extends Error {}

module.exports = { autenticar, ErroAutenticacao };