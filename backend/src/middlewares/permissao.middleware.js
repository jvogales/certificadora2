// controle de permissões por perfil
// retorna  uma FUNÇÃO que gera outra função. Isso é o que permite
//  personalizar quais perfis cada rota aceita.

function exigirPerfil(...perfisPermitidos) {
  // "...perfisPermitidos" junta todos os argumentos passados em um array.


  return (req, res, next) => {

    if (!req.usuario) {

      // evita um erro feio tentando ler .perfil de undefined.
      return res.status(401).json({ erro: 'Usuário não autenticado' });
    }

    // Verifica se o perfil do usuário logado está na lista de perfis
    // permitidos para essa rota específica

    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({ erro: 'Perfil sem permissão para esta operação' });
    }

    next(); // perfil aprovado, segue para o controller
  };
}

module.exports = exigirPerfil;