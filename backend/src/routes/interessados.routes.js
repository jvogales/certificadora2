const express = require('express');
const interessadosController = require('../controllers/interessados.controller');

const router = express.Router();

// rota pública sem autenticação
router.post('/', interessadosController.cadastrar);

module.exports = router;