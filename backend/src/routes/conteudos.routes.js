const express = require('express');
const conteudosController = require('../controllers/conteudos.controller');
const autenticar = require('../middlewares/auth.middleware');
const exigirPerfil = require('../middlewares/permissao.middleware');

const router = express.Router();

// leitura liberada para aluno, monitor e admin (todos autenticados)
router.get('/', autenticar, conteudosController.listar);
router.get('/:id', autenticar, conteudosController.buscarPorId);

//  escrita só para monitor ou admin
router.post('/', autenticar, exigirPerfil('MONITOR', 'ADMIN'), conteudosController.criar);
router.put('/:id', autenticar, exigirPerfil('MONITOR', 'ADMIN'), conteudosController.atualizar);
router.delete('/:id', autenticar, exigirPerfil('MONITOR', 'ADMIN'), conteudosController.excluir);

module.exports = router;