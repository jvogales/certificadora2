const express = require('express');
const referenciasController = require('../controllers/referencia.controller');
const autenticar = require('../middlewares/auth.middleware');
const exigirPerfil = require('../middlewares/permissao.middleware');

const router = express.Router();

//  acesso ao repositório restrito a alunos e monitores autenticados.
// Por isso toda rota passa por 'autenticar', mesmo as de leitura.
router.get('/', autenticar, referenciasController.listar);
router.get('/:id', autenticar, referenciasController.buscarPorId);

// cadastro e gerenciamento: qualquer monitor ou o admin,
// não restrito a quem criou o registro original
router.post('/', autenticar, exigirPerfil('MONITOR', 'ADMIN'), referenciasController.criar);
router.put('/:id', autenticar, exigirPerfil('MONITOR', 'ADMIN'), referenciasController.atualizar);
router.delete('/:id', autenticar, exigirPerfil('MONITOR', 'ADMIN'), referenciasController.excluir);

module.exports = router;