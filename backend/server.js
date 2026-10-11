// ponto de entrada da aplicação 
// toda a configuração de verdade mora no app.js, 
// e esse arquivo só liga tudo e sobe o servidor


require('dotenv').config(); // garante que .env já foi lido antes de qualquer outra coisa

const app = require('./src/app');

const PORTA = process.env.PORT || 3000; // usa a porta do .env, ou 3000 se não tiver definida

app.listen(PORTA, () => {
  console.log(`Talkflix API rodando em http://localhost:${PORTA}`);
});