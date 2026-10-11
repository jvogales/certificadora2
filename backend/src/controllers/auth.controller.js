const authService = require('../services/auth.service');

async function login(req, res) {
  const { login, senha } = req.body;

  // validação básica: garantir que login e senha foram enviados
  if (!login || !senha) {
    return res.status(400).json({ erro: 'Login e senha são obrigatórios' });
  }

  try {
    const resultado = await authService.autenticar(login, senha);
    return res.status(200).json(resultado);
  } catch (erro) {
    if (erro instanceof authService.ErroAutenticacao) {

      // 401 = "Unauthorized" - o padrão HTTP para "credenciais inválidas"
      return res.status(401).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao autenticar' });
  }
}

module.exports = { login };