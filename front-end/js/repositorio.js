/* =========================================================
   PÁGINA DO REPOSITÓRIO DE MATERIAIS
   RF03, RF04, RF05, RF06, RF07, RF10, RF11
   Responsável: João Paulo
   ========================================================= */

(() => {
  const usuario = UI.montarLayout("repositorio");

  // Estado da página: tudo o que define o que aparece na tela
  const estado = {
    conteudos: [], // referências + materiais + atividades
    porId: new Map(), // id -> conteúdo (acesso rápido no pop-up de detalhes)
    indice: null, // índice invertido para a busca
    categoria: "todos",
    tipos: new Set(), // série, filme, música, outro (pode marcar vários)
    ordem: "recentes",
    busca: "",
  };

  const el = {
    principal: document.getElementById("conteudo-principal"),
    abas: document.getElementById("abas-categoria"),
    busca: document.getElementById("campo-busca"),
    ordem: document.getElementById("ordenacao"),
    chips: document.getElementById("chips-tipo"),
    contagem: document.getElementById("contagem"),
    limpar: document.getElementById("btn-limpar"),
    lista: document.getElementById("lista-conteudos"),
    acoes: document.getElementById("acoes-cabecalho"),
    detTopo: document.getElementById("detalhes-topo"),
    detCorpo: document.getElementById("detalhes-corpo"),
    detRodape: document.getElementById("detalhes-rodape"),
  };

  document.getElementById("icone-busca").outerHTML = Icones.busca;
  document.getElementById("btn-fechar-detalhes").innerHTML = Icones.fechar;

  /* ---------- Controle de acesso (RF03) ---------- */

  if (!usuario && !CONFIG.USAR_MOCK) {
    UI.mostrarLogin(el.principal);
    return;
  }
  if (!Permissoes.podeVerRepositorio(usuario)) {
    el.principal.innerHTML = UI.telaSemAcesso("Entre com sua conta de aluno ou monitor para acessar o repositório.");
    return;
  }

  if (Permissoes.podeGerenciar(usuario)) {
    el.acoes.innerHTML = `<a class="btn btn--outline" href="monitor.html">${Icones.editar} Gerenciar conteúdos</a>`;
  }

  /* ---------- Montagem dos controles ---------- */

  function renderizarAbas() {
    const contagem = { todos: estado.conteudos.length, referencia: 0, material: 0, atividade: 0 };
    for (const c of estado.conteudos) contagem[c.categoria]++;

    el.abas.innerHTML = Object.keys(Rotulos.categoriaPlural)
      .map(
        (cat) => `<button class="tabs__btn" role="tab" data-categoria="${cat}" aria-selected="${cat === estado.categoria}">
                    ${Rotulos.categoriaPlural[cat]}<span class="tabs__count">${contagem[cat]}</span>
                  </button>`
      )
      .join("");
  }

  function renderizarChips() {
    // O filtro por tipo de mídia só faz sentido para referências audiovisuais
    el.chips.hidden = !(estado.categoria === "todos" || estado.categoria === "referencia");
    el.chips.innerHTML = Object.keys(Rotulos.tipo)
      .map(
        (tipo) => `<button class="chip" data-tipo="${tipo}" aria-pressed="${estado.tipos.has(tipo)}">
                     ${Icones[tipo]} ${Rotulos.tipo[tipo]}
                   </button>`
      )
      .join("");
  }

  /* ---------- Card de cada conteúdo ---------- */

  const tituloDaReferencia = (id) => (estado.porId.get(id) || {}).titulo;

  function metaDoItem(item) {
    const partes = [];
    if (item.categoria === "referencia") {
      if (item.tipo === "serie") partes.push(Formatar.episodio(item));
      if (item.artista && item.tipo !== "serie") partes.push(item.artista);
      if (item.ondeEncontrar) partes.push(item.ondeEncontrar);
    } else if (item.referenciaId) {
      partes.push("Sobre: " + (tituloDaReferencia(item.referenciaId) || "referência removida"));
    }
    return partes.filter(Boolean).map((p) => `<span>${escaparHtml(p)}</span>`).join("");
  }

  function etiquetaDoItem(item) {
    if (item.categoria === "referencia") return item.ano ? `<span class="badge badge--neutro">${item.ano}</span>` : "";
    return `<span class="badge badge--${item.categoria}">PDF</span>`;
  }

  function cardHtml(item) {
    const ehPdf = item.categoria !== "referencia";
    return `
      <article class="card card--${item.categoria}">
        <div class="card__faixa">
          <span class="card__tipo">
            <span class="icone-tile icone-tile--${item.categoria}">${UI.iconeDoItem(item)}</span>
            ${UI.rotuloDoItem(item)}
          </span>
          ${etiquetaDoItem(item)}
        </div>
        <div class="card__corpo">
          <h2 class="card__titulo">
            <button data-abrir="${item.id}">${escaparHtml(item.titulo)}</button>
          </h2>
          <div class="card__meta">${metaDoItem(item)}</div>
          <p class="card__desc">${escaparHtml(item.descricao)}</p>
        </div>
        <div class="card__rodape">
          <span class="card__data">${Icones.calendario} Cadastrado em ${Formatar.data(item.criadoEm)}</span>
          ${
            ehPdf
              ? `<button class="btn btn--outline btn--sm card__baixar" data-abrir-pdf="${item.id}" aria-label="Abrir PDF de ${escaparHtml(item.titulo)}">${Icones.externo} PDF</button>`
              : `<span class="card__mais">Ver detalhes ${Icones.seta}</span>`
          }
        </div>
      </article>`;
  }

  /* ---------- Aplicação dos filtros e desenho da lista ---------- */

  function filtrosAtivos() {
    return estado.busca.trim() !== "" || estado.tipos.size > 0 || estado.categoria !== "todos";
  }

  function renderizarLista() {
    const idsBusca = estado.indice.buscar(estado.busca);
    // Quando há filtro por tipo de mídia, materiais e atividades (que não têm tipo) saem da lista
    const tiposEfetivos = el.chips.hidden ? new Set() : estado.tipos;

    const filtrados = Busca.filtrar(estado.conteudos, { categoria: estado.categoria, tipos: tiposEfetivos, idsBusca });
    const ordenados = Busca.ordenar(filtrados, estado.ordem);

    const n = ordenados.length;
    el.contagem.textContent = n === 1 ? "1 conteúdo encontrado" : `${n} conteúdos encontrados`;
    el.limpar.hidden = !filtrosAtivos();

    if (n === 0) {
      el.lista.innerHTML = `
        <div class="panel empty" style="grid-column: 1 / -1">
          ${Icones.vazio}
          <h3>Nenhum conteúdo encontrado</h3>
          <p>Tente outras palavras ou remova alguns filtros.</p>
        </div>`;
      return;
    }
    el.lista.innerHTML = ordenados.map(cardHtml).join("");
  }

  function atualizarTudo() {
    renderizarAbas();
    renderizarChips();
    renderizarLista();
  }

  /* ---------- Pop-up de detalhes ---------- */

  function linhaFicha(rotulo, valor, largo = false) {
    if (valor === undefined || valor === null || valor === "") return "";
    return `<div class="${largo ? "ficha__largo" : ""}"><dt>${rotulo}</dt><dd>${escaparHtml(valor)}</dd></div>`;
  }

  // Campos diferentes conforme o tipo de material
  function fichaDoItem(item) {
    let linhas = "";
    if (item.categoria === "referencia") {
      linhas += linhaFicha("Tipo", Rotulos.tipo[item.tipo]);
      linhas += linhaFicha("Ano", item.ano);
      if (item.tipo === "serie") {
        linhas += linhaFicha("Temporada", item.temporada);
        linhas += linhaFicha("Episódio", item.episodio);
      }
      linhas += linhaFicha(item.tipo === "musica" ? "Artista" : "Autor / direção", item.artista);
      linhas += linhaFicha("Onde encontrar", item.ondeEncontrar);
      linhas += linhaFicha("Trecho utilizado", item.trecho, true);
    } else {
      linhas += linhaFicha("Categoria", Rotulos.categoria[item.categoria]);
      linhas += linhaFicha("Referência utilizada", tituloDaReferencia(item.referenciaId));
    }
    linhas += linhaFicha("Cadastrado em", Formatar.data(item.criadoEm));
    linhas += linhaFicha("Cadastrado por", item.criadoPor && item.criadoPor.nome);
    return `<dl class="ficha">${linhas}</dl>`;
  }

  function blocoArquivo(item) {
    if (item.categoria === "referencia" || !item.link) return "";
    return `
      <div class="bloco-arquivo">
        <span class="icone-tile icone-tile--${item.categoria}">${Icones.pdf}</span>
        <div class="bloco-arquivo__info">
          <div class="bloco-arquivo__nome">Arquivo PDF</div>
          <div class="bloco-arquivo__tam">${escaparHtml(item.link)}</div>
        </div>
        <button class="btn btn--primary btn--sm" data-abrir-pdf="${item.id}">${Icones.externo} Abrir</button>
      </div>`;
  }

  // Liga a referência aos PDFs que a usam (e o PDF à sua referência)
  function blocoRelacionados(item) {
    let relacionados = [];
    let titulo = "";
    if (item.categoria === "referencia") {
      relacionados = estado.conteudos.filter((c) => c.referenciaId === item.id);
      titulo = "Materiais e atividades desta referência";
    } else if (estado.porId.has(item.referenciaId)) {
      relacionados = [estado.porId.get(item.referenciaId)];
      titulo = "Referência utilizada";
    }
    if (relacionados.length === 0) return "";
    const itens = relacionados
      .map(
        (r) => `<li><button data-abrir="${r.id}">
                  <span class="icone-tile icone-tile--${r.categoria}">${UI.iconeDoItem(r)}</span>
                  <span>${escaparHtml(r.titulo)}</span>
                </button></li>`
      )
      .join("");
    return `<div class="relacionados"><h3>${titulo}</h3><ul>${itens}</ul></div>`;
  }

  function abrirDetalhes(id) {
    const item = estado.porId.get(id);
    if (!item) return;

    el.detTopo.innerHTML = `
      <span class="icone-tile icone-tile--${item.categoria}">${UI.iconeDoItem(item)}</span>
      <div>
        <div class="detalhes-topo__categoria">${Rotulos.categoria[item.categoria]}</div>
        <h2 id="detalhes-titulo">${escaparHtml(item.titulo)}</h2>
        ${etiquetaDoItem(item)}
      </div>`;

    el.detCorpo.innerHTML = `
      ${item.descricao ? `<p class="detalhes-desc">${escaparHtml(item.descricao)}</p>` : ""}
      ${fichaDoItem(item)}
      ${blocoArquivo(item)}
      ${blocoRelacionados(item)}`;

    const botoes = [];
    if (item.categoria === "referencia" && item.link) {
      botoes.push(
        `<a class="btn btn--outline" href="${escaparHtml(item.link)}" target="_blank" rel="noopener noreferrer">${Icones.externo} Abrir fonte oficial</a>`
      );
    }
    if (Permissoes.podeEditar(usuario, item)) {
      botoes.push(`<a class="btn btn--ghost" href="monitor.html?editar=${encodeURIComponent(item.id)}">${Icones.editar} Editar</a>`);
    }
    botoes.push(`<button class="btn btn--primary" data-fechar="modal-detalhes">Fechar</button>`);
    el.detRodape.innerHTML = botoes.join("");

    if (!document.getElementById("modal-detalhes").classList.contains("is-open")) {
      UI.abrirModal("modal-detalhes");
    } else {
      el.detCorpo.scrollTop = 0; // trocou de item dentro do pop-up (relacionados)
    }
  }

  /* ---------- Abrir o PDF (RF10 / RF11) ---------- */

  // O PDF fica em um serviço externo (ex.: Google Drive); a plataforma guarda só o link
  function abrirPdf(id) {
    const item = estado.porId.get(id);
    if (!item || !item.link) return;
    if (!/^https?:\/\//i.test(item.link)) {
      UI.aviso("Este PDF de exemplo não tem um link completo (https://). Cadastre um link real pela área do monitor.");
      return;
    }
    window.open(item.link, "_blank", "noopener");
  }

  /* ---------- Eventos ---------- */

  el.abas.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-categoria]");
    if (!botao) return;
    estado.categoria = botao.dataset.categoria;
    atualizarTudo();
  });

  el.chips.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-tipo]");
    if (!chip) return;
    const tipo = chip.dataset.tipo;
    if (estado.tipos.has(tipo)) estado.tipos.delete(tipo);
    else estado.tipos.add(tipo);
    renderizarChips();
    renderizarLista();
  });

  el.busca.addEventListener(
    "input",
    debounce(() => {
      estado.busca = el.busca.value;
      renderizarLista();
    }, 200)
  );

  el.ordem.addEventListener("change", () => {
    estado.ordem = el.ordem.value;
    renderizarLista();
  });

  el.limpar.addEventListener("click", () => {
    estado.categoria = "todos";
    estado.tipos.clear();
    estado.busca = "";
    el.busca.value = "";
    atualizarTudo();
  });

  // Um único "ouvinte" para a página toda (delegação de eventos)
  document.addEventListener("click", (e) => {
    const pdfBtn = e.target.closest("[data-abrir-pdf]");
    if (pdfBtn) {
      e.stopPropagation();
      abrirPdf(pdfBtn.dataset.abrirPdf);
      return;
    }
    const abrirBtn = e.target.closest("[data-abrir]");
    if (abrirBtn) abrirDetalhes(abrirBtn.dataset.abrir);
  });

  /* ---------- Carregamento inicial ---------- */

  async function carregar() {
    el.lista.innerHTML = '<div class="card card--carregando"></div>'.repeat(6);
    try {
      estado.conteudos = await Api.listarConteudos();
      estado.porId = new Map(estado.conteudos.map((c) => [c.id, c]));
      estado.indice = new Busca.IndiceInvertido(estado.conteudos);

      // Permite links diretos: repositorio.html?categoria=atividade&abrir=pdf-1
      const params = new URLSearchParams(location.search);
      if (Rotulos.categoriaPlural[params.get("categoria")]) estado.categoria = params.get("categoria");

      atualizarTudo();
      if (params.get("abrir")) abrirDetalhes(params.get("abrir"));
    } catch (erro) {
      if (erro.status === 401) Sessao.sair();
      el.lista.innerHTML = `
        <div class="panel empty" style="grid-column: 1 / -1">
          ${Icones.alerta}
          <h3>Não foi possível carregar o repositório</h3>
          <p>${escaparHtml(erro.message)}</p>
        </div>`;
    }
  }

  carregar();
})();
