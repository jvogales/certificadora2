/* =========================================================
   CONFIGURAÇÃO DO FRONT-END

   USAR_MOCK = true  -> dados simulados (mock-dados.js), salvos
                        no navegador. Não precisa de servidor.
   USAR_MOCK = false -> usa o Back-End do grupo (pasta backend/),
                        no endereço API_URL. O usuário precisa ter
                        feito login (POST /api/auth/login).
   ========================================================= */

const CONFIG = {
  USAR_MOCK: true,
  API_URL: "http://localhost:3000/api",
  ATRASO_MOCK_MS: 150, // simula o tempo de resposta do servidor
};
