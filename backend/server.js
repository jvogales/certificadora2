require('dotenv').config();
const app = require('./src/app');

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
  console.log(`Talkflix API rodando em http://localhost:${PORTA}`);
});