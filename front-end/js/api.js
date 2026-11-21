/* =========================================================
   CAMADA DE ACESSO À API
   As páginas NUNCA chamam fetch diretamente: chamam Api.xxx().

   Rotas usadas do Back-End do grupo (backend/src/routes):
     GET/POST        /api/referencias       (referências audiovisuais)
     GET/PUT/DELETE  /api/referencias/:id
     GET/POST        /api/conteudos         (PDFs: ATIVIDADE ou MATERIAL)
     GET/PUT/DELETE  /api/conteudos/:id

   A API devolve os dados como estão no banco (snake_case, tipos em
   maiúsculas). As funções "converter..." transformam isso no formato
   usado pelas telas, e as funções "montarCorpo..." fazem o caminho
   inverso. Se o Back-End mudar um nome de campo, só muda aqui.

   CONFIG.USAR_MOCK = true simula o banco com mock-dados.js.
   ========================================================= */

const Api = (() => {
  /* ================== Conversão API <-> telas ================== */

  // Referências e PDFs ficam em tabelas diferentes e podem ter o mesmo
  // número de id. Nas telas, o id ganha um prefixo para não colidir.
  const idRef = (n) => "ref-" + n;
  const idPdf = (n) => "pdf-" + n;
  const numeroDoId = (id) => Number(String(id).split("-")[1]);

  function nomeDoUsuario(userId) {
    if (!CONFIG.USAR_MOCK) return null; // a API não devolve o nome de quem cadastrou
    const u = MOCK_USUARIOS.find((x) => x.user_id === userId);
    return u ? u.nome : null;
  }

  // linha de referencia_audiovisual -> item da tela
  function converterReferencia(r) {
    return {
      id: idRef(r.ref_id),
      categoria: "referencia",
      tipo: String(r.tipo || "").toLowerCase(), // SERIE -> serie
      titulo: r.titulo,
      descricao: r.descricao,
      ano: r.ano,
      temporada: r.temporada,
      episodio: r.episodio,
      trecho: r.trecho,
      artista: r.autor_artista,
      ondeEncontrar: r.plataforma_fonte,
      link: r.link_fonte,
      criadoPor: { id: r.id_monitor, nome: nomeDoUsuario(r.id_monitor) },
      criadoEm: r.data_cadastro,
    };
  }

  // linha de conteudo_pdf -> item da tela
  function converterConteudo(c) {
    return {
      id: idPdf(c.conteudo_id),
      categoria: c.tipo === "ATIVIDADE" ? "atividade" : "material",
      titulo: c.titulo,
      descricao: c.descricao,
      link: c.arquivo_url,
      referenciaId: c.id_ref_audio ? idRef(c.id_ref_audio) : null,
      criadoPor: { id: c.id_monitor_criador, nome: nomeDoUsuario(c.id_monitor_criador) },
      criadoEm: c.data_cadastro,
    };
  }

  const vazioParaNull = (v) => (v === undefined || v === "" ? null : v);

  // formulário -> corpo do POST/PUT de /api/referencias
  function montarCorpoReferencia(d) {
    return {
      titulo: d.titulo,
      tipo: String(d.tipo || "").toUpperCase(),
      ano: vazioParaNull(d.ano),
      trecho: vazioParaNull(d.trecho),
      autorArtista: vazioParaNull(d.artista),
      temporada: vazioParaNull(d.temporada),
      episodio: vazioParaNull(d.episodio),
      plataformaFonte: vazioParaNull(d.ondeEncontrar),
      linkFonte: vazioParaNull(d.link),
      descricao: vazioParaNull(d.descricao),
    };
  }

  // formulário -> corpo do POST/PUT de /api/conteudos
  function montarCorpoConteudo(d) {
    return {
      tipo: d.categoria === "atividade" ? "ATIVIDADE" : "MATERIAL",
      titulo: d.titulo,
      descricao: vazioParaNull(d.descricao),
      arquivoUrl: d.link,
      idRefAudio: d.referenciaId ? numeroDoId(d.referenciaId) : null,
    };
  }

  /* ================== Utilidades ================== */

  function erro(status, mensagem) {
    const e = new Error(mensagem);
    e.status = status;
    return e;
  }

  const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const copiar = (obj) => JSON.parse(JSON.stringify(obj));

  /* ================== Modo real (HTTP) ================== */

  async function requisicao(caminho, opcoes = {}) {
    const cabecalhos = {};
    const token = Sessao.token();
    if (token) cabecalhos.Authorization = "Bearer " + token;
    if (opcoes.body) cabecalhos["Content-Type"] = "application/json";

    let resposta;
    try {
      resposta = await fetch(CONFIG.API_URL + caminho, {
        method: opcoes.method || "GET",
        headers: cabecalhos,
        body: opcoes.body ? JSON.stringify(opcoes.body) : undefined,
      });
    } catch (e) {
      throw erro(0, "Não foi possível conectar ao servidor. Verifique se o Back-End está rodando.");
    }

    if (!resposta.ok) {
      let mensagem = "Erro " + resposta.status;
      try {
        const corpo = await resposta.json();
        mensagem = corpo.erro || corpo.mensagem || mensagem; // o Back-End usa { erro: "..." }
      } catch (e) {
        /* resposta sem corpo */
      }
      if (resposta.status === 401) mensagem = "Sua sessão expirou ou você não fez login. Entre novamente.";
      throw erro(resposta.status, mensagem);
    }
    return resposta.status === 204 ? null : resposta.json();
  }

  /* ================== Modo simulado (banco em memória) ================== */

  const CHAVE_STORAGE = "talkflix-mock-banco-v2";

  function bancoInicial() {
    return {
      referencias: copiar(MOCK_REFERENCIAS),
      conteudos: copiar(MOCK_CONTEUDOS_PDF),
      conclusoes: copiar(MOCK_CONCLUSOES),
      usuarios: MOCK_USUARIOS.map((u) => ({ ...u, ativo: true, data_cadastro: "2026-08-01T10:00:00" })),
    };
  }

  function carregarBanco() {
    try {
      const salvo = localStorage.getItem(CHAVE_STORAGE);
      if (salvo) {
        // completa com o que faltar (dados salvos por uma versão anterior da página)
        return { ...bancoInicial(), ...JSON.parse(salvo) };
      }
    } catch (e) {
      /* sem localStorage: usa os dados padrão */
    }
    return bancoInicial();
  }

  let banco = carregarBanco();

  function salvarBanco() {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(banco));
    } catch (e) {
      /* segue só em memória */
    }
  }

  const proximoId = (lista, campo) => lista.reduce((max, x) => Math.max(max, x[campo]), 0) + 1;

  // Reproduz as mesmas validações do Back-End (referencia.service.js e
  // conteudos.service.js), para o modo simulado se comportar igual
  function validarComoBackEnd(categoria, corpo) {
    if (!corpo.titulo) throw erro(400, "Título é obrigatório");
    if (categoria === "referencia") {
      if (!["SERIE", "FILME", "MUSICA", "OUTRO"].includes(corpo.tipo)) throw erro(400, "Tipo inválido");
      if (corpo.tipo === "SERIE" && (!corpo.temporada || !corpo.episodio)) {
        throw erro(400, "Para séries, temporada e episódio são obrigatórios");
      }
      if (corpo.tipo === "MUSICA" && !corpo.autorArtista) throw erro(400, "Para músicas, o artista/autor é obrigatório");
    } else {
      if (!corpo.arquivoUrl) throw erro(400, "O caminho/link do arquivo PDF é obrigatório");
      if (!corpo.idRefAudio) throw erro(400, "Todo conteúdo deve estar vinculado a uma referência audiovisual");
      if (!banco.referencias.some((r) => r.ref_id === corpo.idRefAudio)) {
        throw erro(400, "A referência audiovisual informada não existe");
      }
    }
  }

  function exigirPerfilMock(perfis) {
    const u = Sessao.usuarioAtual();
    if (!u || !perfis.includes(u.perfil)) throw erro(403, "Perfil sem permissão para esta operação");
    return u;
  }

  function verificarPerfilMock() {
    const u = Sessao.usuarioAtual();
    if (!u || (u.perfil !== "monitor" && u.perfil !== "admin")) {
      throw erro(403, "Perfil sem permissão para esta operação");
    }
    return u;
  }

  function linhaReferencia(corpo) {
    return {
      titulo: corpo.titulo, tipo: corpo.tipo, ano: corpo.ano, trecho: corpo.trecho,
      autor_artista: corpo.autorArtista, temporada: corpo.temporada, episodio: corpo.episodio,
      plataforma_fonte: corpo.plataformaFonte, link_fonte: corpo.linkFonte, descricao: corpo.descricao,
    };
  }

  function linhaConteudo(corpo) {
    return {
      tipo: corpo.tipo, titulo: corpo.titulo, descricao: corpo.descricao,
      arquivo_url: corpo.arquivoUrl, id_ref_audio: corpo.idRefAudio,
    };
  }

  /* ================== Funções públicas ================== */

  // Lista referências + materiais + atividades, já no formato das telas
  async function listarConteudos() {
    let referencias, conteudos;
    if (CONFIG.USAR_MOCK) {
      await esperar(CONFIG.ATRASO_MOCK_MS);
      referencias = copiar(banco.referencias);
      conteudos = copiar(banco.conteudos);
    } else {
      // as duas listas são buscadas ao mesmo tempo
      [referencias, conteudos] = await Promise.all([requisicao("/referencias"), requisicao("/conteudos")]);
    }
    return [...referencias.map(converterReferencia), ...conteudos.map(converterConteudo)];
  }

  async function criarConteudo(dados) {
    const ehReferencia = dados.categoria === "referencia";
    const corpo = ehReferencia ? montarCorpoReferencia(dados) : montarCorpoConteudo(dados);

    if (!CONFIG.USAR_MOCK) {
      const criado = await requisicao(ehReferencia ? "/referencias" : "/conteudos", { method: "POST", body: corpo });
      return ehReferencia ? converterReferencia(criado) : converterConteudo(criado);
    }

    await esperar(CONFIG.ATRASO_MOCK_MS);
    const usuario = verificarPerfilMock();
    validarComoBackEnd(dados.categoria, corpo);
    const agora = new Date().toISOString();
    if (ehReferencia) {
      const linha = { ...linhaReferencia(corpo), ref_id: proximoId(banco.referencias, "ref_id"), id_monitor: usuario.id, data_cadastro: agora };
      banco.referencias.push(linha);
      salvarBanco();
      return converterReferencia(linha);
    }
    const linha = { ...linhaConteudo(corpo), conteudo_id: proximoId(banco.conteudos, "conteudo_id"), id_monitor_criador: usuario.id, data_cadastro: agora };
    banco.conteudos.push(linha);
    salvarBanco();
    return converterConteudo(linha);
  }

  async function atualizarConteudo(id, dados) {
    const ehReferencia = String(id).startsWith("ref-");
    const numero = numeroDoId(id);
    const corpo = ehReferencia ? montarCorpoReferencia(dados) : montarCorpoConteudo(dados);

    if (!CONFIG.USAR_MOCK) {
      const caminho = (ehReferencia ? "/referencias/" : "/conteudos/") + numero;
      const atualizado = await requisicao(caminho, { method: "PUT", body: corpo });
      return ehReferencia ? converterReferencia(atualizado) : converterConteudo(atualizado);
    }

    await esperar(CONFIG.ATRASO_MOCK_MS);
    verificarPerfilMock();
    validarComoBackEnd(ehReferencia ? "referencia" : dados.categoria, corpo);
    const lista = ehReferencia ? banco.referencias : banco.conteudos;
    const campo = ehReferencia ? "ref_id" : "conteudo_id";
    const indice = lista.findIndex((x) => x[campo] === numero);
    if (indice === -1) throw erro(404, "Não encontrado");
    lista[indice] = { ...lista[indice], ...(ehReferencia ? linhaReferencia(corpo) : linhaConteudo(corpo)) };
    salvarBanco();
    return ehReferencia ? converterReferencia(lista[indice]) : converterConteudo(lista[indice]);
  }

  async function excluirConteudo(id) {
    const ehReferencia = String(id).startsWith("ref-");
    const numero = numeroDoId(id);

    if (!CONFIG.USAR_MOCK) {
      return requisicao((ehReferencia ? "/referencias/" : "/conteudos/") + numero, { method: "DELETE" });
    }

    await esperar(CONFIG.ATRASO_MOCK_MS);
    verificarPerfilMock();
    // Mesmas travas do banco (chave estrangeira), como o Back-End responde
    if (ehReferencia) {
      if (banco.conteudos.some((c) => c.id_ref_audio === numero)) {
        throw erro(400, "Não é possível excluir esta referência porque existem atividades ou materiais vinculados a ela");
      }
      banco.referencias = banco.referencias.filter((r) => r.ref_id !== numero);
    } else {
      if (banco.conclusoes.some((c) => c.id_atividade === numero)) {
        throw erro(400, "Não é possível excluir este conteúdo porque existem conclusões de atividade vinculadas a ele");
      }
      banco.conteudos = banco.conteudos.filter((c) => c.conteudo_id !== numero);
    }
    salvarBanco();
    return null;
  }

  // Progresso dos alunos (RF17)
  // Modo real usa duas rotas do Back-End:
  //   GET /api/usuarios                  -> lista os usuários (para achar os alunos)
  //   GET /api/progresso/aluno/:alunoId  -> concluídas, disponíveis, percentual e histórico
  async function listarProgressoAlunos() {
    if (!CONFIG.USAR_MOCK) {
      let usuarios;
      try {
        usuarios = await requisicao("/usuarios");
      } catch (e) {
        // No Back-End atual, só o ADMIN pode listar usuários
        if (e.status === 403) {
          throw erro(403, "No Back-End atual, só o administrador pode listar os alunos (GET /api/usuarios). Para o monitor ver esta aba, essa rota precisa aceitar também o perfil MONITOR.");
        }
        throw e;
      }
      const alunos = usuarios.filter((u) => u.perfil === "ALUNO" && u.ativo !== false);
      // busca o progresso de todos os alunos ao mesmo tempo
      const progressos = await Promise.all(alunos.map((a) => requisicao("/progresso/aluno/" + a.user_id)));
      return alunos.map((a, i) => ({
        id: a.user_id,
        nome: a.nome,
        login: a.login,
        concluidas: (progressos[i].historico || []).map((h) => idPdf(h.conteudo_id)),
      }));
    }
    await esperar(CONFIG.ATRASO_MOCK_MS);
    const atividades = new Set(banco.conteudos.filter((c) => c.tipo === "ATIVIDADE").map((c) => c.conteudo_id));
    return banco.usuarios.filter((u) => u.perfil === "ALUNO" && u.ativo !== false).map((u) => ({
      id: u.user_id,
      nome: u.nome,
      login: u.login,
      concluidas: banco.conclusoes
        .filter((c) => c.id_aluno === u.user_id && atividades.has(c.id_atividade))
        .map((c) => idPdf(c.id_atividade)),
    }));
  }

  /* ================== Progresso do próprio aluno ================== */
  // GET /api/progresso/meu, POST e DELETE /api/progresso/:atividadeId/concluir

  function converterProgresso(p) {
    return {
      concluidas: p.atividadesConcluidas,
      disponiveis: p.atividadesDisponiveis,
      percentual: p.percentual,
      historico: (p.historico || []).map((h) => ({ id: idPdf(h.conteudo_id), titulo: h.titulo, data: h.data_conclusao })),
    };
  }

  async function meuProgresso() {
    if (!CONFIG.USAR_MOCK) return converterProgresso(await requisicao("/progresso/meu"));

    await esperar(CONFIG.ATRASO_MOCK_MS);
    const aluno = exigirPerfilMock(["aluno"]);
    const atividades = banco.conteudos.filter((c) => c.tipo === "ATIVIDADE");
    const minhas = banco.conclusoes.filter((c) => c.id_aluno === aluno.id);
    const disponiveis = atividades.length;
    // mesma conta do progresso.service.js (1 casa decimal)
    const percentual = disponiveis > 0 ? Math.round((minhas.length / disponiveis) * 1000) / 10 : 0;
    const historico = minhas
      .map((c) => ({
        conteudo_id: c.id_atividade,
        titulo: (atividades.find((a) => a.conteudo_id === c.id_atividade) || {}).titulo,
        data_conclusao: c.data_conclusao || null,
      }))
      .sort((a, b) => String(b.data_conclusao || "").localeCompare(String(a.data_conclusao || "")));
    return converterProgresso({ atividadesConcluidas: minhas.length, atividadesDisponiveis: disponiveis, percentual, historico });
  }

  async function concluirAtividade(id) {
    const numero = numeroDoId(id);
    if (!CONFIG.USAR_MOCK) return requisicao(`/progresso/${numero}/concluir`, { method: "POST" });

    await esperar(CONFIG.ATRASO_MOCK_MS);
    const aluno = exigirPerfilMock(["aluno"]);
    const conteudo = banco.conteudos.find((c) => c.conteudo_id === numero);
    // mesmas mensagens do progresso.service.js
    if (!conteudo) throw erro(400, "Atividade não encontrada");
    if (conteudo.tipo !== "ATIVIDADE") throw erro(400, "Apenas atividades podem ser marcadas como concluídas, não materiais de aula");
    if (banco.conclusoes.some((c) => c.id_aluno === aluno.id && c.id_atividade === numero)) {
      throw erro(400, "Esta atividade já foi marcada como concluída por você");
    }
    banco.conclusoes.push({ id_aluno: aluno.id, id_atividade: numero, data_conclusao: new Date().toISOString() });
    salvarBanco();
    return null;
  }

  async function desfazerConclusao(id) {
    const numero = numeroDoId(id);
    if (!CONFIG.USAR_MOCK) return requisicao(`/progresso/${numero}/concluir`, { method: "DELETE" });

    await esperar(CONFIG.ATRASO_MOCK_MS);
    const aluno = exigirPerfilMock(["aluno"]);
    const antes = banco.conclusoes.length;
    banco.conclusoes = banco.conclusoes.filter((c) => !(c.id_aluno === aluno.id && c.id_atividade === numero));
    if (banco.conclusoes.length === antes) throw erro(400, "Esta atividade não estava marcada como concluída");
    salvarBanco();
    return null;
  }

  /* ================== Usuários (administração) ================== */
  // GET /api/usuarios, POST /api/usuarios, DELETE /api/usuarios/:id (inativa)

  function converterUsuario(u) {
    return {
      id: u.user_id,
      nome: u.nome,
      login: u.login,
      perfil: String(u.perfil || "").toLowerCase(),
      ativo: u.ativo !== false,
      criadoEm: u.data_cadastro,
    };
  }

  async function listarUsuarios() {
    if (!CONFIG.USAR_MOCK) return (await requisicao("/usuarios")).map(converterUsuario);
    await esperar(CONFIG.ATRASO_MOCK_MS);
    exigirPerfilMock(["admin"]);
    return copiar(banco.usuarios)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
      .map(converterUsuario);
  }

  async function criarUsuario(dados) {
    const corpo = { nome: dados.nome, login: dados.login, senha: dados.senha, perfil: String(dados.perfil || "").toUpperCase() };
    if (!CONFIG.USAR_MOCK) return converterUsuario(await requisicao("/usuarios", { method: "POST", body: corpo }));

    await esperar(CONFIG.ATRASO_MOCK_MS);
    exigirPerfilMock(["admin"]);
    // mesmas regras do usuarios.service.js
    if (!corpo.nome || !corpo.login || !corpo.senha || !corpo.perfil) throw erro(400, "Nome, login, senha e perfil são obrigatórios");
    if (!["ADMIN", "MONITOR", "ALUNO"].includes(corpo.perfil)) throw erro(400, "Perfil inválido");
    if (banco.usuarios.some((u) => u.login === corpo.login)) throw erro(400, "Já existe um usuário com esse login");
    const novo = {
      user_id: proximoId(banco.usuarios, "user_id"),
      nome: corpo.nome,
      login: corpo.login,
      perfil: corpo.perfil,
      ativo: true,
      data_cadastro: new Date().toISOString(),
    };
    banco.usuarios.push(novo);
    salvarBanco();
    return converterUsuario(novo);
  }

  // O Back-End não apaga o usuário: marca como inativo (mantém o histórico)
  async function inativarUsuario(id) {
    if (!CONFIG.USAR_MOCK) return requisicao("/usuarios/" + encodeURIComponent(id), { method: "DELETE" });
    await esperar(CONFIG.ATRASO_MOCK_MS);
    exigirPerfilMock(["admin"]);
    const u = banco.usuarios.find((x) => x.user_id === id);
    if (!u) throw erro(404, "Usuário não encontrado");
    u.ativo = false;
    salvarBanco();
    return { user_id: id, ativo: false };
  }

  // Volta os dados simulados ao estado original
  function restaurarMock() {
    banco = bancoInicial();
    salvarBanco();
  }

  return {
    listarConteudos,
    criarConteudo,
    atualizarConteudo,
    excluirConteudo,
    listarProgressoAlunos,
    meuProgresso,
    concluirAtividade,
    desfazerConclusao,
    listarUsuarios,
    criarUsuario,
    inativarUsuario,
    restaurarMock,
  };
})();
