/* =========================================================
   TELA INICIAL (index.html): comportamento da landing page
   - coloca os ícones nos elementos [data-icone]
   - abre os pop-ups ([data-abrir]) com UI.abrirModal; o fechamento
     (X, Cancelar, clique fora, Esc) já é tratado pelo ui.js
   - cadastro de interesse ("Tenho interesse")

   O login é montado pelo entrada.js (carregado antes deste arquivo).

   Interesse: o Back-End (interessados.controller.js) aceita
   { email, nome, matricula }. "É da UTFPR?" não tem coluna própria:
   quem é da UTFPR informa a matrícula; quem é de fora não envia.
   O nível de fluência não é coletado porque o banco não tem onde guardá-lo.

   CONFIG.USAR_MOCK = true  -> salva num "banco" do navegador (localStorage)
   CONFIG.USAR_MOCK = false -> POST {API_URL}/interessados (rota pública)
   ========================================================= */

(() => {
  const $ = (id) => document.getElementById(id);

  document.querySelectorAll("[data-icone]").forEach((el) => {
    el.innerHTML = Icones[el.dataset.icone] || "";
  });

  /* ---------- Cadastro de interesse: API (simulada ou real) ---------- */

  const CHAVE_MOCK = "talkflix-mock-interessados-v1";

  // Mesmos e-mails de database/talkflix_mock-insert.sql, para testar "e-mail já cadastrado"
  const INTERESSADOS_INICIAIS = [
    { email: "ana.visitante@gmail.com", nome: "Ana Souza", matricula: null },
    { email: "pedro.aluno@alunos.utfpr.edu.br", nome: "Pedro Lima", matricula: "2650011" },
    { email: "contato.externo@hotmail.com", nome: "Carla Mendes", matricula: null },
  ];

  function erro(status, mensagem) {
    const e = new Error(mensagem);
    e.status = status;
    return e;
  }

  function lerMock() {
    try {
      const salvo = localStorage.getItem(CHAVE_MOCK);
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      /* sem localStorage: usa os dados iniciais */
    }
    return INTERESSADOS_INICIAIS.map((i) => ({ ...i }));
  }

  function gravarMock(lista) {
    try {
      localStorage.setItem(CHAVE_MOCK, JSON.stringify(lista));
    } catch (e) {
      /* segue só em memória */
    }
  }

  async function cadastrarInteresse(corpo) {
    if (CONFIG.USAR_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, CONFIG.ATRASO_MOCK_MS));
      const lista = lerMock();
      // Mesma resposta do interessados.service.js
      if (lista.some((i) => i.email === corpo.email)) throw erro(400, "E-mail já cadastrado");
      lista.push({ nome: corpo.nome, email: corpo.email, matricula: corpo.matricula || null, data_cadastro: new Date().toISOString() });
      gravarMock(lista);
      return;
    }

    let resposta;
    try {
      resposta = await fetch(CONFIG.API_URL + "/interessados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
    } catch (e) {
      throw erro(0, "Não foi possível conectar ao servidor. Verifique se o Back-End está rodando.");
    }
    if (!resposta.ok) {
      const dados = await resposta.json().catch(() => ({})); // o Back-End responde { erro: "..." }
      throw erro(resposta.status, dados.erro || "Erro " + resposta.status);
    }
  }

  /* ---------- Formulário de interesse ---------- */

  const form = $("form-interesse");
  const campoMatricula = $("campo-matricula");
  const botaoEnviar = $("btn-enviar-interesse");
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // mesma regra do interessados.service.js
  let enviando = false;

  const ehDaUtfpr = () => form.elements.vinculo.value === "utfpr";

  function atualizarCampoMatricula() {
    campoMatricula.hidden = !ehDaUtfpr();
  }

  function limparErros() {
    form.querySelectorAll(".field.has-error").forEach((f) => f.classList.remove("has-error"));
    form.querySelectorAll("[data-erro]").forEach((span) => (span.textContent = ""));
  }

  function mostrarErros(erros) {
    limparErros();
    let primeiro = null;
    for (const [campo, mensagem] of Object.entries(erros)) {
      const span = form.querySelector(`[data-erro="${campo}"]`);
      if (!span) continue;
      span.textContent = mensagem;
      const field = span.closest(".field");
      field.classList.add("has-error");
      if (!primeiro) primeiro = field;
    }
    if (primeiro) primeiro.querySelector("input, select").focus();
  }

  function coletarDados() {
    return {
      nome: form.elements.nome.value.trim(),
      email: form.elements.email.value.trim().toLowerCase(),
      vinculo: form.elements.vinculo.value,
      matricula: form.elements.matricula.value.trim(),
    };
  }

  // Devolve { campo: "mensagem" }; objeto vazio = tudo certo
  function validar(dados) {
    const erros = {};
    if (dados.nome.length < 2) erros.nome = "Informe seu nome.";
    if (!EMAIL.test(dados.email)) erros.email = "Informe um e-mail válido.";
    if (!dados.vinculo) erros.vinculo = "Informe se você é da UTFPR ou de fora.";
    if (dados.vinculo === "utfpr" && !/^[A-Za-z0-9]{3,50}$/.test(dados.matricula)) {
      erros.matricula = "Informe sua matrícula (apenas letras e números).";
    }
    return erros;
  }

  function prepararFormulario() {
    form.reset();
    limparErros();
    atualizarCampoMatricula();
    botaoEnviar.disabled = false;
    botaoEnviar.textContent = "Cadastrar interesse";
  }

  form.addEventListener("change", atualizarCampoMatricula);

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (enviando) return;

    const dados = coletarDados();
    const erros = validar(dados);
    if (Object.keys(erros).length > 0) {
      mostrarErros(erros);
      return;
    }
    limparErros();

    // Só vai para a API o que o Back-End guarda
    const corpo = { nome: dados.nome, email: dados.email };
    if (dados.vinculo === "utfpr") corpo.matricula = dados.matricula;

    enviando = true;
    botaoEnviar.disabled = true;
    botaoEnviar.textContent = "Enviando...";
    try {
      await cadastrarInteresse(corpo);
      UI.fecharModal("modal-interesse");
      UI.abrirModal("modal-interesse-ok");
    } catch (falha) {
      // 400 = e-mail inválido ou já cadastrado (únicas validações do interessados.service.js)
      if (falha.status === 400) mostrarErros({ email: falha.message });
      else UI.aviso(falha.message || "Não foi possível enviar. Tente novamente.", "error");
    } finally {
      enviando = false;
      botaoEnviar.disabled = false;
      botaoEnviar.textContent = "Cadastrar interesse";
    }
  });

  /* ---------- Abertura dos pop-ups ---------- */

  document.addEventListener("click", (e) => {
    const gatilho = e.target.closest("[data-abrir]");
    if (!gatilho) return;
    if (gatilho.dataset.abrir === "modal-interesse") prepararFormulario();
    UI.abrirModal(gatilho.dataset.abrir);
  });
})();
