// CONTROLLER: recebe a requisição, chama o service e retorna a resposta para o cliente

const interessadosService = require('../services/interessados.service');

async function cadastrar(req, res) {
  const { email, nome, matricula } = req.body;

  try {
    const interessado = await interessadosService.cadastrar({ email, nome, matricula });
    
    // status 201 = "Created", o padrão HTTP para "algo novo foi criado com sucesso"
    return res.status(201).json(interessado);
  } catch (erro) {

    // Se o erro veio do service como ErroValidacao, sabemos que é "culpa"
    // de quem fez a requisição (e-mail inválido ou duplicado)
    if (erro instanceof interessadosService.ErroValidacao) {
      return res.status(400).json({ erro: erro.message });
    }

    // Qualquer outro erro (ex: banco fora do ar) é um problema do nosso
    // lado, e registramos no console para conseguir debugar depois
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao cadastrar interessado' });
  }
}

module.exports = { cadastrar };