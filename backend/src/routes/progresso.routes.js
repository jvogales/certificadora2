const express = require('express');
const progressoController = require('../controllers/progresso.controller');
const autenticar = require('../middlewares/auth.middleware');
const exigirPerfil = require('../middlewares/permissao.middleware');

const router = express.Router();

// só o aluno marca sua própria conclusão
router.post('/:atividadeId/concluir', autenticar, exigirPerfil('ALUNO'), progressoController.marcarConcluida);

// Permite ao aluno desmarcar uma atividade concluída
router.delete('/:atividadeId/concluir', autenticar, exigirPerfil('ALUNO'), progressoController.desmarcarConcluida);

// aluno consulta o próprio progresso
router.get('/meu', autenticar, exigirPerfil('ALUNO'), progressoController.consultarProprioProgresso);

// monitor e admin consultam progresso de qualquer aluno
router.get('/aluno/:alunoId', autenticar, exigirPerfil('MONITOR', 'ADMIN'), progressoController.consultarProgressoDeAluno);

module.exports = router;