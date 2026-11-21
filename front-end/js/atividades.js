/* =========================================================
   PÁGINA DE ATIVIDADES
   RF06, RF11, RF12
   - todos os perfis veem as atividades em PDF e a referência da aula
   - o aluno marca e desmarca a conclusão (POST / DELETE
     /api/progresso/:id/concluir) e filtra pendentes e concluídas
   - monitor e administrador consultam e vão para a gestão
   ========================================================= */

(() => {
  const usuario = UI.montarLayout("atividades");
  const $ = (id) => document.getElementById(id);
  const principal = $("conteudo-principal");

  if (!usuario && !CONFIG.USAR_MOCK) {
    UI.mostrarLogin(principal);
    return;
  }
  if (!Permissoes.podeVerRepositorio(usuario)) {
    principal.innerHTML = UI.telaSemAcesso("Entre com sua conta para ver as atividades.");
    return;
  }

  const ehAluno = Permissoes.ehAluno(usuario);

  const estado = {
    atividades: [],
    porId: new Map(), // todos os conteúdos (para achar a referência de cada atividade)
    indice: null,
    feitas: new Set(), // ids das atividades concluídas pelo aluno
    progresso: null,
    situacao: "todas", // todas | pendentes | concluidas
    busca: "",
    ordem: "antigos",
    ocupado: false,
  };

  $("icone-busca").outerHTML = Icones.busca;
  $("descricao").textContent = ehAluno
    ? "Baixe o PDF, faça a atividade e marque como concluída. Se marcar por engano, é só desfazer."
    : "Atividades disponíveis para os alunos. A conclusão é marcada por cada aluno na própria conta.";

  if (Permissoes.podeGerenciar(usuario)) {
    $("acoes-cabecalho").innerHTML = `<a class="btn btn--outline" href="monitor.html">${Icones.editar} Gerenciar atividades</a>`;
  }

  /* ---------- Resumo e abas (aluno) ---------- */

  function renderizarResumo() {
    if (!ehAluno) return;
    const p = estado.progresso;
    const pct = Math.round(p.percentual);
    $("resumo").hidden = false;
    $("resumo-texto").textContent = `${p.concluidas} de ${p.disponiveis} concluídas · ${pct}%`;
    $("resumo-barra").style.width = pct + "%";
    $("resumo-barra-wrap").setAttribute("aria-valuenow", String(pct));
  }

  function renderizarAbas() {
    if (!ehAluno) return;
    const total = estado.atividades.length;
    const feitas = estado.atividades.filter((a) => estado.feitas.has(a.id)).length;
    const abas = [
      { id: "todas", rotulo: "Todas", n: total },
      { id: "pendentes", rotulo: "Pendentes", n: total - feitas },
      { id: "concluidas", rotulo: "Concluídas", n: feitas },
    ];
    $("abas-situacao").hidden = false;
    $("abas-situacao").innerHTML = abas
      .map(
        (a) => `<button class="tabs__btn" role="tab" data-situacao="${a.id}" aria-selected="${a.id === estado.situacao}">
                  ${a.rotulo}<span class="tabs__count">${a.n}</span></button>`
      )
      .join("");
  }

  /* ---------- Cards ---------- */

  function cardHtml(a) {
    const ref = estado.porId.get(a.referenciaId);
    const feita = estado.feitas.has(a.id);
    const pdf = a.link
      ? `<a class="btn btn--outline btn--sm" href="${escaparHtml(a.link)}" target="_blank" rel="noopener noreferrer">${Icones.externo} Abrir PDF</a>`
      : "";
    let botaoConclusao = "";
    if (ehAluno) {
      botaoConclusao = feita
        ? `<button class="btn btn--outline btn--sm btn--concluida" data-desfazer="${a.id}" title="Clique para desfazer">${Icones.check} Concluída</button>`
        : `<button class="btn btn--primary btn--sm" data-concluir="${a.id}">Marcar como concluída</button>`;
    }
    return `
      <article class="card card--atividade ${feita ? "card--feita" : ""}">
        <div class="card__faixa">
          <span class="card__tipo">
            <span class="icone-tile icone-tile--atividade">${Icones.atividade}</span>
            Atividade
          </span>
          ${feita ? `<span class="tag tag--success">${Icones.check} Feita</span>` : '<span class="badge badge--atividade">PDF</span>'}
        </div>
        <div class="card__corpo">
          <h2 class="card__titulo">${escaparHtml(a.titulo)}</h2>
          <div class="card__meta">${ref ? `<span>Sobre: ${escaparHtml(ref.titulo)}</span>` : ""}</div>
          <p class="card__desc">${escaparHtml(a.descricao)}</p>
        </div>
        <div class="card__rodape">
          <div class="card__acoes">${pdf}${botaoConclusao}</div>
        </div>
      </article>`;
  }

  function renderizarLista() {
    const idsBusca = estado.indice.buscar(estado.busca);
    let lista = estado.atividades.filter((a) => !idsBusca || idsBusca.has(a.id));
    if (estado.situacao === "pendentes") lista = lista.filter((a) => !estado.feitas.has(a.id));
    if (estado.situacao === "concluidas") lista = lista.filter((a) => estado.feitas.has(a.id));
    lista = Busca.ordenar(lista, estado.ordem);

    $("contagem").textContent = lista.length === 1 ? "1 atividade" : `${lista.length} atividades`;

    if (lista.length === 0) {
      const msg =
        estado.atividades.length === 0
          ? "Nenhuma atividade cadastrada ainda."
          : estado.situacao === "pendentes" && !estado.busca
            ? "Tudo em dia! Você concluiu todas as atividades."
            : "Nenhuma atividade encontrada com esses filtros.";
      $("lista-atividades").innerHTML = `<div class="panel empty" style="grid-column: 1 / -1">${Icones.vazio}<h3>${msg}</h3></div>`;
      return;
    }
    $("lista-atividades").innerHTML = lista.map(cardHtml).join("");
  }

  function renderizarTudo() {
    renderizarResumo();
    renderizarAbas();
    renderizarLista();
  }

  /* ---------- Carregamento ---------- */

  function aplicarProgresso(progresso) {
    estado.progresso = progresso;
    estado.feitas = new Set(progresso.historico.map((h) => h.id));
  }

  async function carregar() {
    $("lista-atividades").innerHTML = '<div class="card card--carregando"></div>'.repeat(3);
    const [conteudos, progresso] = await Promise.all([
      Api.listarConteudos(),
      ehAluno ? Api.meuProgresso() : Promise.resolve(null),
    ]);
    estado.porId = new Map(conteudos.map((c) => [c.id, c]));
    estado.atividades = conteudos.filter((c) => c.categoria === "atividade");
    // o índice inclui o título da referência, para buscar pela série ("friends")
    estado.indice = new Busca.IndiceInvertido(
      estado.atividades.map((a) => ({ ...a, trecho: (estado.porId.get(a.referenciaId) || {}).titulo }))
    );
    if (progresso) aplicarProgresso(progresso);

    // atividades.html?situacao=pendentes abre direto na aba
    const pedida = new URLSearchParams(location.search).get("situacao");
    if (ehAluno && ["todas", "pendentes", "concluidas"].includes(pedida)) estado.situacao = pedida;

    renderizarTudo();
  }

  /* ---------- Eventos ---------- */

  async function executar(acao, id, mensagem) {
    if (estado.ocupado) return;
    estado.ocupado = true;
    try {
      await acao(id);
      aplicarProgresso(await Api.meuProgresso());
      renderizarTudo();
      UI.aviso(mensagem, "success");
    } catch (erro) {
      UI.aviso(erro.message || "Não foi possível atualizar.", "error");
    } finally {
      estado.ocupado = false;
    }
  }

  document.addEventListener("click", (e) => {
    const aba = e.target.closest("[data-situacao]");
    if (aba) {
      estado.situacao = aba.dataset.situacao;
      renderizarAbas();
      renderizarLista();
      return;
    }
    const concluir = e.target.closest("[data-concluir]");
    if (concluir) return executar(Api.concluirAtividade, concluir.dataset.concluir, "Atividade marcada como concluída.");
    const desfazer = e.target.closest("[data-desfazer]");
    if (desfazer) return executar(Api.desfazerConclusao, desfazer.dataset.desfazer, "Conclusão desfeita.");
  });

  $("campo-busca").addEventListener(
    "input",
    debounce(() => {
      estado.busca = $("campo-busca").value;
      renderizarLista();
    }, 200)
  );

  $("ordenacao").addEventListener("change", () => {
    estado.ordem = $("ordenacao").value;
    renderizarLista();
  });

  carregar().catch((erro) => {
    if (erro.status === 401) Sessao.sair();
    $("lista-atividades").innerHTML = `<div class="panel empty" style="grid-column: 1 / -1">${Icones.alerta}<h3>Não foi possível carregar as atividades</h3><p>${escaparHtml(erro.message)}</p></div>`;
  });
})();
