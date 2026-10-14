/* =========================================================
   PÁGINA DA ÁREA DO MONITOR
   RF14, RF15, RF16, RF17 / UC11 a UC16
   Responsável: João Paulo
   ========================================================= */

(() => {
  const usuario = UI.montarLayout("monitor");

  const estado = {
    conteudos: [],
    porId: new Map(),
    indice: null,
    busca: "",
    categoria: "todos",
    apenasMeus: false,
    // formulário
    categoriaForm: null,
    editandoId: null,
    salvando: false,
    // exclusão
    idParaExcluir: null,
    // progresso
    alunos: null,
  };

  const $ = (id) => document.getElementById(id);

  const el = {
    principal: $("conteudo-principal"),
    saudacao: $("saudacao"),
    atalhos: $("atalhos"),
    busca: $("campo-busca"),
    filtroCategoria: $("filtro-categoria"),
    filtroMeus: $("filtro-meus"),
    tabela: $("tabela-conteudos"),
    abaConteudos: $("aba-conteudos"),
    abaProgresso: $("aba-progresso"),
    painelConteudos: $("painel-conteudos"),
    painelProgresso: $("painel-progresso"),
    resumoProgresso: $("resumo-progresso"),
    tabelaProgresso: $("tabela-progresso"),
    form: $("form-conteudo"),
    formTitulo: $("form-titulo"),
    formCategoria: $("form-categoria"),
    segmentosTipo: $("segmentos-tipo"),
    selectReferencia: $("f-referencia"),
    rotuloArtista: $("rotulo-artista"),
    btnSalvar: $("btn-salvar"),
    excluirTexto: $("excluir-texto"),
    btnConfirmarExclusao: $("btn-confirmar-exclusao"),
  };

  /* ---------- Controle de acesso: só monitor e administrador ---------- */

  if (!usuario && !CONFIG.USAR_MOCK) {
    UI.mostrarLogin(el.principal);
    return;
  }
  if (!Permissoes.podeGerenciar(usuario)) {
    el.principal.innerHTML = UI.telaSemAcesso("Esta área é exclusiva para monitores e para o administrador do projeto.");
    return;
  }

  $("icone-busca").outerHTML = Icones.busca;
  ["btn-fechar-form", "btn-fechar-aluno"].forEach((id) => ($(id).innerHTML = Icones.fechar));

  const primeiroNome = usuario.nome.split(" ")[0];
  el.saudacao.textContent =
    usuario.perfil === "admin"
      ? `Olá, ${primeiroNome}. Como administrador, você pode editar e excluir qualquer conteúdo da plataforma.`
      : `Olá, ${primeiroNome}. Cadastre e organize as referências, os materiais de aula e as atividades do projeto.`;

  /* ---------- Atalhos de cadastro ---------- */

  const ATALHOS = [
    { categoria: "referencia", plural: "Referências audiovisuais", botao: "Nova referência", icone: "serie" },
    { categoria: "material", plural: "Materiais de aula", botao: "Novo material", icone: "pdf" },
    { categoria: "atividade", plural: "Atividades", botao: "Nova atividade", icone: "atividade" },
  ];

  const temReferencias = () => estado.conteudos.some((c) => c.categoria === "referencia");

  function renderizarAtalhos() {
    el.atalhos.innerHTML = ATALHOS.map((a) => {
      const total = estado.conteudos.filter((c) => c.categoria === a.categoria).length;
      // Material e atividade precisam de uma referência para se vincular
      const bloqueado = a.categoria !== "referencia" && !temReferencias();
      return `
        <div class="atalho">
          <div class="atalho__topo">
            <div>
              <div class="atalho__numero">${total}</div>
              <div class="atalho__rotulo">${a.plural}</div>
            </div>
            <span class="icone-tile icone-tile--${a.categoria}">${Icones[a.icone]}</span>
          </div>
          <button class="btn btn--primary btn--sm" data-novo="${a.categoria}" ${bloqueado ? 'disabled title="Cadastre uma referência audiovisual primeiro"' : ""}>
            ${Icones.mais} ${a.botao}
          </button>
        </div>`;
    }).join("");
  }

  /* ---------- Tabela de conteúdos ---------- */

  function subtituloDoItem(item) {
    const partes = [UI.rotuloDoItem(item)];
    if (item.categoria === "referencia") {
      if (item.ano) partes.push(item.ano);
      if (item.tipo === "serie") partes.push(Formatar.episodio(item));
      if (item.ondeEncontrar) partes.push(item.ondeEncontrar);
    }
    return partes.filter(Boolean).map(escaparHtml).join(" · ");
  }

  // Referência: quantos PDFs dependem dela. PDF: a qual referência pertence.
  function vinculoDoItem(item) {
    if (item.categoria === "referencia") {
      const n = estado.conteudos.filter((c) => c.referenciaId === item.id).length;
      return n === 0 ? '<span class="muted">Nenhum PDF</span>' : `${n} PDF${n > 1 ? "s" : ""} vinculado${n > 1 ? "s" : ""}`;
    }
    const ref = estado.porId.get(item.referenciaId);
    return ref ? escaparHtml(ref.titulo) : '<span class="muted">—</span>';
  }

  function autorDoItem(item) {
    if (!item.criadoPor || item.criadoPor.id == null) return "—";
    if (item.criadoPor.id === usuario.id) return '<span class="autor-voce">Você</span>';
    return escaparHtml(item.criadoPor.nome || "Outro monitor");
  }

  function linhaHtml(item) {
    const podeEditar = Permissoes.podeEditar(usuario, item);
    const bloqueio = podeEditar ? "" : 'disabled title="Sem permissão para alterar"';
    return `
      <tr>
        <td>
          <div class="item-celula">
            <span class="icone-tile icone-tile--${item.categoria}">${UI.iconeDoItem(item)}</span>
            <div>
              <div class="item-celula__titulo">${escaparHtml(item.titulo)}</div>
              <div class="item-celula__sub">${subtituloDoItem(item)}</div>
            </div>
          </div>
        </td>
        <td>${vinculoDoItem(item)}</td>
        <td>${Formatar.data(item.criadoEm)}</td>
        <td>${autorDoItem(item)}</td>
        <td>
          <div class="tabela__acoes">
            <button class="btn btn--ghost btn--icon" data-editar="${item.id}" aria-label="Editar ${escaparHtml(item.titulo)}" ${bloqueio}>
              ${Icones.editar}
            </button>
            <button class="btn btn--ghost btn--icon btn--perigo" data-excluir="${item.id}" aria-label="Excluir ${escaparHtml(item.titulo)}" ${bloqueio}>
              ${Icones.lixeira}
            </button>
          </div>
        </td>
      </tr>`;
  }

  function renderizarTabela() {
    const filtrados = Busca.filtrar(estado.conteudos, {
      categoria: estado.categoria,
      apenasMeus: estado.apenasMeus,
      usuarioId: usuario.id,
      idsBusca: estado.indice.buscar(estado.busca),
    });
    const ordenados = Busca.ordenar(filtrados, "recentes");

    if (ordenados.length === 0) {
      el.tabela.innerHTML = `<tr><td colspan="5"><div class="empty">${Icones.vazio}<h3>Nenhum conteúdo encontrado</h3><p>Altere a busca ou cadastre um novo conteúdo.</p></div></td></tr>`;
      return;
    }
    el.tabela.innerHTML = ordenados.map(linhaHtml).join("");
  }

  function renderizarTudo() {
    renderizarAtalhos();
    renderizarTabela();
  }

  async function recarregar() {
    estado.conteudos = await Api.listarConteudos();
    estado.porId = new Map(estado.conteudos.map((c) => [c.id, c]));
    estado.indice = new Busca.IndiceInvertido(estado.conteudos);
    renderizarTudo();
    if (estado.alunos) carregarProgresso(); // mantém o progresso coerente após mudanças
  }

  /* ---------- Formulário: campos que aparecem conforme categoria e tipo ---------- */

  function montarSegmentosTipo() {
    el.segmentosTipo.innerHTML = Object.keys(Rotulos.tipo)
      .map(
        (tipo) => `<label class="segmento">
                     <input type="radio" name="tipo" value="${tipo}" />
                     <span>${Icones[tipo]} ${Rotulos.tipo[tipo]}</span>
                   </label>`
      )
      .join("");
  }

  function tipoSelecionado() {
    const marcado = el.form.querySelector('input[name="tipo"]:checked');
    return marcado ? marcado.value : "";
  }

  const ROTULO_ARTISTA = { serie: "Criadores", filme: "Direção", musica: "Artista", outro: "Autor" };

  // Mostra só os campos que se aplicam ao conteúdo escolhido
  function atualizarCamposVisiveis() {
    const tipo = tipoSelecionado();
    el.form.querySelectorAll("[data-categorias]").forEach((campo) => {
      let visivel = campo.dataset.categorias.split(",").includes(estado.categoriaForm);
      if (visivel && campo.dataset.tipos) visivel = campo.dataset.tipos.split(",").includes(tipo);
      campo.hidden = !visivel;
    });
    el.form.querySelectorAll("[data-req-tipo]").forEach((marca) => {
      marca.hidden = marca.dataset.reqTipo !== tipo;
    });
    el.rotuloArtista.textContent = ROTULO_ARTISTA[tipo] || "Autor / artista";
  }

  function preencherSelectReferencias(selecionada) {
    const referencias = Busca.ordenar(estado.conteudos.filter((c) => c.categoria === "referencia"), "titulo");
    el.selectReferencia.innerHTML =
      '<option value="">Selecione a referência</option>' +
      referencias
        .map(
          (r) => `<option value="${r.id}" ${r.id === selecionada ? "selected" : ""}>${escaparHtml(r.titulo)} (${Rotulos.tipo[r.tipo] || "Outro"})</option>`
        )
        .join("");
  }

  // Campos visíveis (os escondidos ficam dentro de um elemento [hidden])
  const visivel = (elemento) => !elemento.closest("[hidden]");

  function limparErros() {
    el.form.querySelectorAll(".field.has-error").forEach((f) => f.classList.remove("has-error"));
    el.form.querySelectorAll("[data-erro]").forEach((span) => (span.textContent = ""));
  }

  function mostrarErros(erros) {
    limparErros();
    let primeiro = null;
    for (const [campo, mensagem] of Object.entries(erros)) {
      // "link" existe duas vezes no HTML (referência e PDF): usa o que está visível
      const span = [...el.form.querySelectorAll(`[data-erro="${campo}"]`)].find(visivel);
      if (!span) continue;
      span.textContent = mensagem;
      const field = span.closest(".field");
      field.classList.add("has-error");
      if (!primeiro) primeiro = field;
    }
    if (primeiro) {
      const foco = primeiro.querySelector("input, select, textarea");
      if (foco) foco.focus();
    }
  }

  function abrirFormulario(categoria, item = null) {
    estado.categoriaForm = categoria;
    estado.editandoId = item ? item.id : null;

    el.form.reset();
    limparErros();

    el.formCategoria.textContent = Rotulos.categoria[categoria];
    el.formTitulo.textContent = item ? "Editar conteúdo" : `Cadastrar ${Rotulos.categoria[categoria].toLowerCase()}`;
    el.btnSalvar.textContent = item ? "Salvar alterações" : "Cadastrar";

    if (categoria !== "referencia") preencherSelectReferencias(item && item.referenciaId);

    // Na edição, preenche os campos com os dados atuais
    if (item) {
      for (const campo of el.form.elements) {
        if (!campo.name) continue;
        if (campo.type === "radio") campo.checked = campo.value === item[campo.name];
        else if (item[campo.name] !== undefined && item[campo.name] !== null) campo.value = item[campo.name];
      }
    }

    atualizarCamposVisiveis();
    UI.abrirModal("modal-form");
  }

  // Lê só os campos visíveis (campos escondidos não vão para a API)
  function coletarDados() {
    const dados = { categoria: estado.categoriaForm };
    const numericos = ["ano", "temporada", "episodio"];
    for (const campo of el.form.elements) {
      if (!campo.name || !visivel(campo)) continue;
      if (campo.type === "radio") {
        if (campo.checked) dados[campo.name] = campo.value;
        continue;
      }
      const valor = campo.value.trim();
      if (valor === "") continue;
      dados[campo.name] = numericos.includes(campo.name) && /^\d+$/.test(valor) ? Number(valor) : valor;
    }
    return dados;
  }

  async function salvar(evento) {
    evento.preventDefault();
    if (estado.salvando) return;

    const dados = coletarDados();
    const erros = Validacao.validarConteudo(dados);
    if (Object.keys(erros).length > 0) {
      mostrarErros(erros);
      return;
    }

    const editando = Boolean(estado.editandoId);
    estado.salvando = true;
    el.btnSalvar.classList.add("is-carregando");
    el.btnSalvar.textContent = "Salvando...";
    try {
      if (editando) {
        await Api.atualizarConteudo(estado.editandoId, dados);
        UI.aviso("Conteúdo atualizado.", "success");
      } else {
        await Api.criarConteudo(dados);
        UI.aviso("Conteúdo cadastrado e disponível no repositório.", "success");
      }
      UI.fecharModal("modal-form");
      await recarregar();
    } catch (erro) {
      UI.aviso(erro.message || "Não foi possível salvar.", "error");
    } finally {
      estado.salvando = false;
      el.btnSalvar.classList.remove("is-carregando");
      el.btnSalvar.textContent = editando ? "Salvar alterações" : "Cadastrar";
    }
  }

  /* ---------- Exclusão com confirmação ---------- */

  function pedirExclusao(id) {
    const item = estado.porId.get(id);
    if (!item || !Permissoes.podeEditar(usuario, item)) return;
    estado.idParaExcluir = id;

    // O banco não deixa apagar uma referência que ainda tem PDFs vinculados
    const vinculados = item.categoria === "referencia" ? estado.conteudos.filter((c) => c.referenciaId === id).length : 0;
    if (vinculados > 0) {
      el.excluirTexto.textContent = `"${item.titulo}" tem ${vinculados} material(is) ou atividade(s) vinculado(s). Exclua ou mude a referência deles antes de excluir esta referência.`;
      el.btnConfirmarExclusao.hidden = true;
    } else {
      let texto = `"${item.titulo}" deixará de aparecer para os alunos.`;
      if (item.categoria === "atividade") texto += " Se algum aluno já marcou esta atividade como concluída, o sistema não permitirá a exclusão.";
      el.excluirTexto.textContent = texto;
      el.btnConfirmarExclusao.hidden = false;
    }
    UI.abrirModal("modal-excluir");
  }

  el.btnConfirmarExclusao.addEventListener("click", async () => {
    const id = estado.idParaExcluir;
    if (!id) return;
    el.btnConfirmarExclusao.classList.add("is-carregando");
    try {
      await Api.excluirConteudo(id);
      UI.fecharModal("modal-excluir");
      UI.aviso("Conteúdo excluído.", "success");
      await recarregar();
    } catch (erro) {
      UI.fecharModal("modal-excluir");
      UI.aviso(erro.message || "Não foi possível excluir.", "error");
    } finally {
      el.btnConfirmarExclusao.classList.remove("is-carregando");
      estado.idParaExcluir = null;
    }
  });

  /* ---------- Progresso dos alunos (RF17) ---------- */

  // Progresso = atividades concluídas ÷ atividades disponíveis (RF13)
  function calcularProgresso(aluno, totalAtividades) {
    if (totalAtividades === 0) return 0;
    return Math.round((aluno.concluidas.length / totalAtividades) * 100);
  }

  function classeBarra(pct) {
    if (pct < 34) return "progress__bar--baixo";
    if (pct < 67) return "progress__bar--medio";
    return "";
  }

  async function carregarProgresso() {
    el.tabelaProgresso.innerHTML = '<tr><td colspan="4" class="muted">Carregando...</td></tr>';
    try {
      estado.alunos = await Api.listarProgressoAlunos();
    } catch (erro) {
      el.resumoProgresso.innerHTML = "";
      el.tabelaProgresso.innerHTML = `<tr><td colspan="4"><div class="empty">${Icones.alerta}<h3>Progresso indisponível</h3><p>${escaparHtml(erro.message)}</p></div></td></tr>`;
      return;
    }

    const total = estado.conteudos.filter((c) => c.categoria === "atividade").length;
    const linhas = estado.alunos
      .map((a) => ({ ...a, pct: calcularProgresso(a, total) }))
      .sort((a, b) => b.pct - a.pct || a.nome.localeCompare(b.nome, "pt-BR"));

    const media = linhas.length ? Math.round(linhas.reduce((soma, a) => soma + a.pct, 0) / linhas.length) : 0;
    el.resumoProgresso.innerHTML = `
      <div class="resumo-progresso__item"><div class="resumo-progresso__valor">${linhas.length}</div><div class="muted">Alunos</div></div>
      <div class="resumo-progresso__item"><div class="resumo-progresso__valor">${total}</div><div class="muted">Atividades disponíveis</div></div>
      <div class="resumo-progresso__item"><div class="resumo-progresso__valor">${media}%</div><div class="muted">Progresso médio da turma</div></div>`;

    el.tabelaProgresso.innerHTML = linhas
      .map(
        (a) => `
        <tr>
          <td>
            <div class="item-celula__titulo">${escaparHtml(a.nome)}</div>
            <div class="item-celula__sub">${escaparHtml(a.login || "")}</div>
          </td>
          <td>${a.concluidas.length} de ${total}</td>
          <td>
            <div class="progresso-celula">
              <div class="progress" role="progressbar" aria-valuenow="${a.pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Progresso de ${escaparHtml(a.nome)}">
                <div class="progress__bar ${classeBarra(a.pct)}" style="width: ${a.pct}%"></div>
              </div>
              <span class="progresso-celula__pct">${a.pct}%</span>
            </div>
          </td>
          <td><button class="btn btn--outline btn--sm" data-aluno="${a.id}">Ver</button></td>
        </tr>`
      )
      .join("");
  }

  function abrirAluno(id) {
    const aluno = estado.alunos.find((a) => String(a.id) === String(id));
    if (!aluno) return;
    const atividades = Busca.ordenar(estado.conteudos.filter((c) => c.categoria === "atividade"), "antigos");
    const feitas = new Set(aluno.concluidas);
    $("aluno-titulo").textContent = aluno.nome;
    $("aluno-corpo").innerHTML = `
      <p class="muted">${feitas.size} de ${atividades.length} atividades marcadas como concluídas. O progresso reflete a conclusão declarada pelo aluno, não uma nota.</p>
      <ul class="lista-atividades">
        ${atividades
          .map(
            (at) => `<li>
              <span>${escaparHtml(at.titulo)}</span>
              ${feitas.has(at.id) ? `<span class="tag tag--success">${Icones.check} Concluída</span>` : '<span class="tag">Pendente</span>'}
            </li>`
          )
          .join("")}
      </ul>`;
    UI.abrirModal("modal-aluno");
  }

  /* ---------- Abas ---------- */

  function trocarAba(mostrarProgresso) {
    el.abaConteudos.setAttribute("aria-selected", String(!mostrarProgresso));
    el.abaProgresso.setAttribute("aria-selected", String(mostrarProgresso));
    el.painelConteudos.hidden = mostrarProgresso;
    el.painelProgresso.hidden = !mostrarProgresso;
    if (mostrarProgresso && !estado.alunos) carregarProgresso();
  }

  el.abaConteudos.addEventListener("click", () => trocarAba(false));
  el.abaProgresso.addEventListener("click", () => trocarAba(true));

  /* ---------- Outros eventos ---------- */

  el.busca.addEventListener(
    "input",
    debounce(() => {
      estado.busca = el.busca.value;
      renderizarTabela();
    }, 200)
  );

  el.filtroCategoria.addEventListener("change", () => {
    estado.categoria = el.filtroCategoria.value;
    renderizarTabela();
  });

  el.filtroMeus.addEventListener("click", () => {
    estado.apenasMeus = !estado.apenasMeus;
    el.filtroMeus.setAttribute("aria-pressed", String(estado.apenasMeus));
    renderizarTabela();
  });

  el.segmentosTipo.addEventListener("change", atualizarCamposVisiveis);
  el.form.addEventListener("submit", salvar);

  document.addEventListener("click", (e) => {
    const novo = e.target.closest("[data-novo]");
    if (novo && !novo.disabled) return abrirFormulario(novo.dataset.novo);

    const editar = e.target.closest("[data-editar]");
    if (editar && !editar.disabled) {
      const item = estado.porId.get(editar.dataset.editar);
      return abrirFormulario(item.categoria, item);
    }

    const excluir = e.target.closest("[data-excluir]");
    if (excluir && !excluir.disabled) return pedirExclusao(excluir.dataset.excluir);

    const aluno = e.target.closest("[data-aluno]");
    if (aluno) abrirAluno(aluno.dataset.aluno);
  });

  /* ---------- Carregamento inicial ---------- */

  async function iniciar() {
    montarSegmentosTipo();
    el.tabela.innerHTML = '<tr><td colspan="5" class="muted">Carregando...</td></tr>';
    try {
      await recarregar();
    } catch (erro) {
      if (erro.status === 401) Sessao.sair();
      el.tabela.innerHTML = `<tr><td colspan="5"><div class="empty">${Icones.alerta}<h3>Não foi possível carregar</h3><p>${escaparHtml(erro.message)}</p></div></td></tr>`;
      return;
    }

    // Vindo do repositório pelo botão "Editar": monitor.html?editar=ref-1
    const idEditar = new URLSearchParams(location.search).get("editar");
    const item = idEditar && estado.porId.get(idEditar);
    if (item && Permissoes.podeEditar(usuario, item)) abrirFormulario(item.categoria, item);
  }

  iniciar();
})();
