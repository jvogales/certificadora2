/* =========================================================
   CONFIGURAÇÃO DO FRONT-END

   O modo é escolhido automaticamente:
   - Site aberto pelo servidor do Back-End (npm start e depois
     http://localhost:3000): usa a API real e o banco PostgreSQL.
   - Site aberto direto do arquivo (dois cliques no index.html):
     modo de demonstração, com os dados de mock-dados.js salvos
     no navegador. Não precisa de servidor.
   ========================================================= */

const CONFIG = (() => {
  const viaServidor = location.protocol === "http:" || location.protocol === "https:";
  // Servido pelo próprio Back-End (porta 3000): a API está no mesmo endereço.
  // Servido por outra ferramenta (ex.: Live Server): a API continua na porta 3000.
  const apiNoMesmoEndereco = viaServidor && location.port === "3000";
  return {
    USAR_MOCK: !viaServidor,
    API_URL: apiNoMesmoEndereco ? location.origin + "/api" : "http://localhost:3000/api",
    ATRASO_MOCK_MS: 150, // simula o tempo de resposta do servidor
  };
})();
