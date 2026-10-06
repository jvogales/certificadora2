const express = require('express');
const cors = require('cors');
const interessadosRoutes = require('./routes/interessados.routes');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/interessados', interessadosRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = app;