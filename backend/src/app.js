const express = require('express');
const cors = require('cors');
const path = require('path');

const interessadosRoutes = require('./routes/interessados.routes');
const usuariosRoutes = require('./routes/usuarios.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/interessados', interessadosRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = app;
