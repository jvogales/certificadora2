/* =========================================================
   MEU PAINEL (área do aluno)
   RF11, RF12, RF13
   - mostra o progresso: concluídas ÷ disponíveis (GET /api/progresso/meu)
   - lista as próximas atividades com "Marcar como concluída"
     (POST /api/progresso/:id/concluir)
   - lista as concluídas com "Desfazer" (DELETE /api/progresso/:id/concluir)
   ========================================================= */

(() => {
  const usuario = UI.montarLayout("aluno");
  const $ = (id) => document.getElementById(id);
  const principal = $("conteudo-principal");

  /* ---------- Controle de acesso: só alunos ---------- */

  if (!usuario && !CONFIG.USAR_MOCK) {
    UI.mostrarLogin(principal);
    return;
  }
  if (!Permissoes.ehAluno(usuario)) {
    principal.innerHTML = UI.telaSemAcesso("Este painel é dos alunos. Use o menu ao lado para acessar a sua área.");
    return;
  }

  $("saudacao").textContent = `Olá, ${usuario.nome.split(" ")[0]}!`;
  $("link-todas").insertAdjacentHTML("beforeend", Icones.seta);

  const estado = {
    conteudos: [],
    porId: new Map(),
    progresso: null,
    ocupado: false, // evita cliques repetidos enquanto a API responde
  };

  const QTD_MAX = 5; // quantas atividades aparecem em cada lista do painel

  /* ---------- Progresso ---------- */

  function renderizarProgresso() {
    const p = estado.progresso;
    const pct = Math.round(p.percentual);
    $("progresso-numero").textContent = pct + "%";
    $("progresso-barra").style.width = pct + "%";
    $("progresso-barra-wrap").setAttribute("aria-valuenow", String(pct));
    $("progresso-texto").textContent =
      p.disponiveis === 0
        ? "Ainda não há atividades cadastradas."
        : `Você concluiu ${p.concluidas} de ${p.disponiveis} atividade${p.disponiveis > 1 ? "s" : ""}.`;
  }

  /* ---------- Listas ---------- */

  function tituloDaReferencia(item) {
    const ref = estado.porId.get(item.referenciaId);
    return ref ? "Sobre: " + ref.titulo : "";
  }

  function botaoPdf(item) {
    if (!item.link) return "";
    return `<a class="btn btn--ghost btn--icon" href="${escaparHtml(item.link)}" target="_blank" rel="noopener noreferrer"
               aria-label="Abrir PDF de ${escaparHtml(item.titulo)}" title="Abrir PDF">${Icones.externo}</a>`;
  }

  function renderizarPendentes() {
    const feitas = new Set(estado.progresso.historico.map((h) => h.id));
    // mais antigas primeiro: é a ordem em que foram passadas nas aulas
    const pendentes = Busca.ordenar(
      estado.conteudos.filter((c) => c.categoria === "atividade" && !feitas.has(c.id)),
      "antigos"
    );

    if (pendentes.length === 0) {
      $("lista-pendentes").innerHTML = `<li class="vazio-curto">${
        estado.progresso.disponiveis === 0 ? "Nenhuma atividade cadastrada ainda." : "Tudo em dia! Você concluiu todas as atividades."
      }</li>`;
      return;
    }

    $("lista-pendentes").innerHTML = pendentes
      .slice(0, QTD_MAX)
      .map(
        (a) => `
        <li class="tarefa">
          <span class="icone-tile icone-tile--atividade">${Icones.atividade}</span>
          <div class="tarefa__info">
            <div class="tarefa__titulo">${escaparHtml(a.titulo)}</div>
            <div class="tarefa__sub">${escaparHtml(tituloDaReferencia(a))}</div>
          </div>
          <div class="tarefa__acoes">
            ${botaoPdf(a)}
            <button class="btn btn--outline btn--sm" data-concluir="${a.id}">${Icones.check} Concluí</button>
          </div>
        </li>`
      )
      .join("");

    if (pendentes.length > QTD_MAX) {
      $("lista-pendentes").insertAdjacentHTML(
        "beforeend",
        `<li class="muted" style="font-size:14px">E mais ${pendentes.length - QTD_MAX} na página de atividades.</li>`
      );
    }
  }

  function renderizarConcluidas() {
    const historico = estado.progresso.historico;
    if (historico.length === 0) {
      $("lista-concluidas").innerHTML = '<li class="vazio-curto">Quando você concluir uma atividade, ela aparece aqui.</li>';
      return;
    }
    $("lista-concluidas").innerHTML = historico
      .slice(0, QTD_MAX)
      .map(
        (h) => `
        <li class="tarefa">
          <span class="icone-tile" style="color: var(--color-success)">${Icones.check}</span>
          <div class="tarefa__info">
            <div class="tarefa__titulo">${escaparHtml(h.titulo || "Atividade")}</div>
            <div class="tarefa__sub">${h.data ? "Concluída em " + Formatar.data(h.data) : "Concluída"}</div>
          </div>
          <div class="tarefa__acoes">
            <button class="btn btn--ghost btn--sm" data-desfazer="${h.id}" title="Desmarcar esta atividade">Desfazer</button>
          </div>
        </li>`
      )
      .join("");
  }

  function renderizarAtalhos() {
    const contar = (cat) => estado.conteudos.filter((c) => c.categoria === cat).length;
    const atalhos = [
      { href: "repositorio.html?categoria=referencia", icone: "serie", cat: "referencia", rotulo: "Referências das aulas" },
      { href: "repositorio.html?categoria=material", icone: "pdf", cat: "material", rotulo: "Materiais de aula" },
      { href: "atividades.html", icone: "atividade", cat: "atividade", rotulo: "Todas as atividades" },
    ];
    $("atalhos").innerHTML = atalhos
      .map(
        (a) => `
        <a class="atalho-link" href="${a.href}">
          <span class="icone-tile icone-tile--${a.cat}">${Icones[a.icone]}</span>
          <span>
            <span class="atalho-link__numero">${contar(a.cat)}</span>
            <span class="atalho-link__rotulo" style="display:block">${a.rotulo}</span>
          </span>
          <span class="perfil__seta">${Icones.seta}</span>
        </a>`
      )
      .join("");
  }

  function renderizarTudo() {
    renderizarProgresso();
    renderizarPendentes();
    renderizarConcluidas();
    renderizarAtalhos();
  }

  /* ---------- Carregamento ---------- */

  async function carregar() {
    // conteúdos e progresso são buscados ao mesmo tempo
    const [conteudos, progresso] = await Promise.all([Api.listarConteudos(), Api.meuProgresso()]);
    estado.conteudos = conteudos;
    estado.porId = new Map(conteudos.map((c) => [c.id, c]));
    estado.progresso = progresso;
    renderizarTudo();
  }

  // Depois de concluir/desfazer, só o progresso muda: não precisa rebuscar os conteúdos
  async function atualizarProgresso() {
    estado.progresso = await Api.meuProgresso();
    renderizarTudo();
  }

  /* ---------- Concluir / desfazer ---------- */

  async function executar(acao, id, mensagem) {
    if (estado.ocupado) return;
    estado.ocupado = true;
    try {
      await acao(id);
      await atualizarProgresso();
      UI.aviso(mensagem, "success");
    } catch (erro) {
      UI.aviso(erro.message || "Não foi possível atualizar.", "error");
    } finally {
      estado.ocupado = false;
    }
  }

  document.addEventListener("click", (e) => {
    const concluir = e.target.closest("[data-concluir]");
    if (concluir) return executar(Api.concluirAtividade, concluir.dataset.concluir, "Atividade marcada como concluída.");
    const desfazer = e.target.closest("[data-desfazer]");
    if (desfazer) return executar(Api.desfazerConclusao, desfazer.dataset.desfazer, "Conclusão desfeita.");
  });

  carregar().catch((erro) => {
    if (erro.status === 401) Sessao.sair();
    principal.insertAdjacentHTML(
      "beforeend",
      `<div class="panel empty">${Icones.alerta}<h3>Não foi possível carregar o painel</h3><p>${escaparHtml(erro.message)}</p></div>`
    );
    $("progresso-texto").textContent = "Indisponível.";
  });
})();
