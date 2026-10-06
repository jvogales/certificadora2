const express = require('express');
const usuariosController = require('../controllers/usuarios.controller');

const router = express.Router();

// quando o módulo de autenticação existir precisa proteger estas 3 rotas
// para aceitar somente perfil ADMIN 
router.post('/', usuariosController.cadastrar);
router.get('/', usuariosController.listar);
router.delete('/:id', usuariosController.remover);

module.exports = router;