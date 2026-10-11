const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// rota pública: é aqui que se obtém o token, então não tem autenticação prévia
router.post('/login', authController.login);

module.exports = router;