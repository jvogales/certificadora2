/* =========================================================
   ADMINISTRAÇÃO DE USUÁRIOS
   RF01, RF02 (cadastro prévio pela coordenação)
   - lista os usuários           GET    /api/usuarios
   - cadastra aluno/monitor/admin POST   /api/usuarios
   - inativa (não apaga)          DELETE /api/usuarios/:id
   Todas as rotas exigem o perfil ADMIN no Back-End.
   ========================================================= */

(() => {
  const usuario = UI.montarLayout("admin");
  const $ = (id) => document.getElementById(id);
  const principal = $("conteudo-principal");

  if (!usuario && !CONFIG.USAR_MOCK) {
    UI.mostrarLogin(principal);
    return;
  }
  if (!Permissoes.podeAdministrar(usuario)) {
    principal.innerHTML = UI.telaSemAcesso("Esta área é exclusiva do administrador do projeto.");
    return;
  }

  const estado = {
    usuarios: [],
    busca: "",
    perfil: "todos",
    mostrarInativos: false,
    idParaInativar: null,
    salvando: false,
  };

  const form = $("form-usuario");
  const PERFIS = [
    { id: "aluno", rotulo: "Aluno", icone: "usuario" },
    { id: "monitor", rotulo: "Monitor", icone: "monitor" },
    { id: "admin", rotulo: "Administrador", icone: "admin" },
  ];

  $("icone-busca").outerHTML = Icones.busca;
  $("btn-fechar-usuario").innerHTML = Icones.fechar;
  $("btn-novo-usuario").innerHTML = `${Icones.mais} Novo usuário`;
  $("segmentos-perfil").innerHTML = PERFIS.map(
    (p) => `<label class="segmento"><input type="radio" name="perfil" value="${p.id}" /><span>${Icones[p.icone]} ${p.rotulo}</span></label>`
  ).join("");

  /* ---------- Totais ---------- */

  function renderizarTotais() {
    const ativos = estado.usuarios.filter((u) => u.ativo);
    const total = (perfil) => ativos.filter((u) => u.perfil === perfil).length;
    const cards = [
      { perfil: "aluno", plural: "Alunos ativos", icone: "usuario", cor: "referencia" },
      { perfil: "monitor", plural: "Monitores ativos", icone: "monitor", cor: "atividade" },
      { perfil: "admin", plural: "Administradores", icone: "admin", cor: "material" },
    ];
    $("totais").innerHTML = cards
      .map(
        (c) => `
        <div class="atalho">
          <div class="atalho__topo">
            <div>
              <div class="atalho__numero">${total(c.perfil)}</div>
              <div class="atalho__rotulo">${c.plural}</div>
            </div>
            <span class="icone-tile icone-tile--${c.cor}">${Icones[c.icone]}</span>
          </div>
        </div>`
      )
      .join("");
  }

  /* ---------- Tabela ---------- */

  function filtrados() {
    const termos = Busca.tokenizar(estado.busca);
    return estado.usuarios.filter((u) => {
      if (!estado.mostrarInativos && !u.ativo) return false;
      if (estado.perfil !== "todos" && u.perfil !== estado.perfil) return false;
      // cada palavra digitada precisa aparecer no nome ou no login
      const texto = Busca.normalizar(u.nome + " " + u.login);
      return termos.every((t) => texto.includes(t));
    });
  }

  function linhaHtml(u) {
    const ehVoce = u.id === usuario.id;
    const podeInativar = u.ativo && !ehVoce;
    const motivo = ehVoce ? "Você não pode inativar a própria conta" : "Usuário já inativo";
    return `
      <tr class="${u.ativo ? "" : "linha--inativa"}">
        <td>
          <div class="item-celula__titulo">${escaparHtml(u.nome)} ${ehVoce ? '<span class="autor-voce">(você)</span>' : ""}</div>
          <div class="item-celula__sub">${escaparHtml(u.login)}</div>
        </td>
        <td><span class="badge badge--${u.perfil}">${Rotulos.perfil[u.perfil] || u.perfil}</span></td>
        <td>${u.ativo ? `<span class="tag tag--success">${Icones.check} Ativo</span>` : '<span class="tag tag--inativo">Inativo</span>'}</td>
        <td>${Formatar.data(u.criadoEm)}</td>
        <td>
          <div class="tabela__acoes">
            <button class="btn btn--ghost btn--sm btn--perigo" data-inativar="${u.id}" ${podeInativar ? "" : `disabled title="${motivo}"`}>
              Inativar
            </button>
          </div>
        </td>
      </tr>`;
  }

  function renderizarTabela() {
    const lista = filtrados();
    if (lista.length === 0) {
      $("tabela-usuarios").innerHTML = `<tr><td colspan="5"><div class="empty">${Icones.vazio}<h3>Nenhum usuário encontrado</h3><p>Altere a busca ou os filtros.</p></div></td></tr>`;
      return;
    }
    $("tabela-usuarios").innerHTML = lista.map(linhaHtml).join("");
  }

  async function recarregar() {
    estado.usuarios = await Api.listarUsuarios();
    renderizarTotais();
    renderizarTabela();
  }

  /* ---------- Cadastro ---------- */

  function limparErros() {
    form.querySelectorAll(".field.has-error").forEach((f) => f.classList.remove("has-error"));
    form.querySelectorAll("[data-erro]").forEach((s) => (s.textContent = ""));
  }

  function mostrarErros(erros) {
    limparErros();
    let primeiro = null;
    for (const [campo, msg] of Object.entries(erros)) {
      const span = form.querySelector(`[data-erro="${campo}"]`);
      if (!span) continue;
      span.textContent = msg;
      span.closest(".field").classList.add("has-error");
      if (!primeiro) primeiro = span.closest(".field");
    }
    if (primeiro) (primeiro.querySelector("input") || primeiro).focus();
  }

  function coletar() {
    const marcado = form.querySelector('input[name="perfil"]:checked');
    return {
      perfil: marcado ? marcado.value : "",
      nome: form.elements.nome.value.trim(),
      login: form.elements.login.value.trim(),
      senha: form.elements.senha.value,
      confirmacao: form.elements.confirmacao.value,
    };
  }

  $("btn-novo-usuario").addEventListener("click", () => {
    form.reset();
    limparErros();
    UI.abrirModal("modal-usuario");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (estado.salvando) return;
    const dados = coletar();
    const erros = Validacao.validarUsuario(dados);
    if (Object.keys(erros).length) return mostrarErros(erros);

    const botao = $("btn-salvar-usuario");
    estado.salvando = true;
    botao.classList.add("is-carregando");
    botao.textContent = "Cadastrando...";
    try {
      const novo = await Api.criarUsuario(dados);
      UI.fecharModal("modal-usuario");
      UI.aviso(`${novo.nome} foi cadastrado como ${(Rotulos.perfil[novo.perfil] || "").toLowerCase()}.`, "success");
      await recarregar();
    } catch (erro) {
      // login repetido volta do Back-End como 400
      if (erro.status === 400 && /login/i.test(erro.message)) mostrarErros({ login: erro.message });
      else UI.aviso(erro.message || "Não foi possível cadastrar.", "error");
    } finally {
      estado.salvando = false;
      botao.classList.remove("is-carregando");
      botao.textContent = "Cadastrar";
    }
  });

  /* ---------- Inativação ---------- */

  document.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-inativar]");
    if (!botao || botao.disabled) return;
    const alvo = estado.usuarios.find((u) => String(u.id) === botao.dataset.inativar);
    if (!alvo) return;
    estado.idParaInativar = alvo.id;
    $("inativar-texto").textContent = `${alvo.nome} (${alvo.login}) não vai mais conseguir entrar na plataforma. O histórico dessa conta é mantido.`;
    UI.abrirModal("modal-inativar");
  });

  $("btn-confirmar-inativar").addEventListener("click", async () => {
    const id = estado.idParaInativar;
    if (id == null) return;
    const botao = $("btn-confirmar-inativar");
    botao.classList.add("is-carregando");
    try {
      await Api.inativarUsuario(id);
      UI.fecharModal("modal-inativar");
      UI.aviso("Usuário inativado.", "success");
      await recarregar();
    } catch (erro) {
      UI.fecharModal("modal-inativar");
      UI.aviso(erro.message || "Não foi possível inativar.", "error");
    } finally {
      botao.classList.remove("is-carregando");
      estado.idParaInativar = null;
    }
  });

  /* ---------- Filtros ---------- */

  $("campo-busca").addEventListener(
    "input",
    debounce(() => {
      estado.busca = $("campo-busca").value;
      renderizarTabela();
    }, 200)
  );

  $("filtro-perfil").addEventListener("change", () => {
    estado.perfil = $("filtro-perfil").value;
    renderizarTabela();
  });

  $("filtro-inativos").addEventListener("click", () => {
    estado.mostrarInativos = !estado.mostrarInativos;
    $("filtro-inativos").setAttribute("aria-pressed", String(estado.mostrarInativos));
    renderizarTabela();
  });

  /* ---------- Início ---------- */

  $("tabela-usuarios").innerHTML = '<tr><td colspan="5" class="muted">Carregando...</td></tr>';
  recarregar().catch((erro) => {
    if (erro.status === 401) Sessao.sair();
    $("tabela-usuarios").innerHTML = `<tr><td colspan="5"><div class="empty">${Icones.alerta}<h3>Não foi possível carregar</h3><p>${escaparHtml(erro.message)}</p></div></td></tr>`;
  });
})();
