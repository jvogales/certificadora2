const express = require('express');
const usuariosController = require('../controllers/usuarios.controller');
const autenticar = require('../middlewares/auth.middleware');
const exigirPerfil = require('../middlewares/permissao.middleware');

const router = express.Router();

// só o administrador gerencia usuários
router.post('/', autenticar, exigirPerfil('ADMIN'), usuariosController.cadastrar);
router.get('/', autenticar, exigirPerfil('ADMIN'), usuariosController.listar);
router.delete('/:id', autenticar, exigirPerfil('ADMIN'), usuariosController.remover);
// O ":id" na URL é um parâmetro dinâmico - captura qualquer valor que venha depois 
// de "/usuarios/" e o disponibiliza como req.params.id no controlador

module.exports = router;