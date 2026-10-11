// MIDDLEWARE DE AUTENTICAÇÃO: função que roda antes da requisição chegar no 
// controller, para verificar se o usuário está autenticado

const jwt = require('jsonwebtoken');

// 'req' = a requisição recebida, 'res' = a resposta a ser enviada,
// 'next' = uma função que quando chamada "libera a passagem" para a
// próxima etapa

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não informado' });
  }

  const token = cabecalho.split(' ')[1];

  try {

    // jwt.verify confere a assinatura do token usando o mesmo JWT_SECRET
    // que foi usado para criá-lo (no auth.service.js). Se alguém tentar
    // forjar um token sem conhecer essa chave, essa verificação falha.
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Anexamos os dados do usuário na própria requisição, para que o
    // controller (e o próximo middleware, exigirPerfil) consigam acessá-los
    // através de req.usuario, sem precisar decodificar o token de novo.
    req.usuario = { userId: payload.userId, perfil: payload.perfil };

    next(); // libera a passagem para a próxima etapa
  } catch (erro) {

    // jwt.verify lança erro se o token estiver expirado, adulterado,
    // ou simplesmente inválido
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

module.exports = autenticar;