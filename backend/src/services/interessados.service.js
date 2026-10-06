const interessadoRepository = require('../repositories/interessado.repository');

// Valida formato básico de e-mail
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function cadastrar({ email, nome, matricula }) {
  if (!email || !emailValido(email)) {
    throw new ErroValidacao('E-mail inválido');
  }

  const jaExiste = await interessadoRepository.buscarPorEmail(email);
  if (jaExiste) {
    throw new ErroValidacao('E-mail já cadastrado');
  }

  return interessadoRepository.criar({ email, nome, matricula });
}

class ErroValidacao extends Error {}

module.exports = { cadastrar, ErroValidacao };