const express = require('express');
const cors = require('cors');
const path = require('path');

// Importamos os arquivos de rotas de cada módulo já construído
const interessadosRoutes = require('./routes/interessados.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const authRoutes = require('./routes/auth.routes');
const referenciasRoutes = require('./routes/referencia.routes');

const app = express();

// cors() permite que um front-end rodando em outra porta/origem
// consiga chamar essa API sem ser bloqueado pelo navegador por política de segurança
app.use(cors());

// express.json() ensina o Express a entender corpos de requisição no
// formato JSON, preenchendo automaticamente req.body
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/interessados', interessadosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/referencias', referenciasRoutes);

// Rota simples, sem módulo próprio, só para confirmar que o servidor
// está respondendo
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = app;