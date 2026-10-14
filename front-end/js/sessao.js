/* =========================================================
   SESSÃO E PERMISSÕES (RF08 / RF09)

   Modo real: o login é feito em POST /api/auth/login, que devolve
     { token, usuario: { userId, nome, perfil } }
   e isso fica salvo no sessionStorage do navegador:
     "talkflix-token"   -> o token JWT
     "talkflix-usuario" -> o objeto usuario
   O pop-up de login da página inicial pode chamar Sessao.entrar().

   Modo simulado: o usuário é escolhido no seletor "Ver como".
   ========================================================= */

const Sessao = (() => {
  const CHAVE_TOKEN = "talkflix-token";
  const CHAVE_USUARIO = "talkflix-usuario";
  const CHAVE_PERFIL_DEMO = "talkflix-perfil-demo";

  // Usuários do modo simulado (mesmos ids de database/talkflix_mock-insert.sql)
  const PERFIS_DEMO = {
    aluno: 5, // João Paulo Barros
    monitorMaria: 2,
    monitorLucas: 3,
    admin: 1,
  };

  function ler(storage, chave) {
    try {
      return storage.getItem(chave);
    } catch (e) {
      return null;
    }
  }

  function gravar(storage, chave, valor) {
    try {
      if (valor === null) storage.removeItem(chave);
      else storage.setItem(chave, valor);
    } catch (e) {
      /* armazenamento indisponível */
    }
  }

  // Formato do Back-End -> formato usado pelas telas
  function normalizar(u) {
    if (!u) return null;
    return {
      id: u.userId ?? u.user_id,
      nome: u.nome,
      perfil: String(u.perfil || "").toLowerCase(), // ADMIN -> admin
    };
  }

  function perfilDemo() {
    const chave = ler(localStorage, CHAVE_PERFIL_DEMO);
    return PERFIS_DEMO[chave] ? chave : "monitorMaria";
  }

  function definirPerfilDemo(chave) {
    gravar(localStorage, CHAVE_PERFIL_DEMO, chave);
  }

  function usuarioAtual() {
    if (CONFIG.USAR_MOCK) {
      return normalizar(MOCK_USUARIOS.find((u) => u.user_id === PERFIS_DEMO[perfilDemo()]));
    }
    try {
      return normalizar(JSON.parse(ler(sessionStorage, CHAVE_USUARIO)));
    } catch (e) {
      return null;
    }
  }

  function token() {
    return ler(sessionStorage, CHAVE_TOKEN);
  }

  // Login real no Back-End do grupo
  async function entrar(login, senha) {
    let resposta;
    try {
      resposta = await fetch(CONFIG.API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, senha }),
      });
    } catch (e) {
      throw new Error("Não foi possível conectar ao servidor.");
    }
    const corpo = await resposta.json().catch(() => ({}));
    if (!resposta.ok) throw new Error(corpo.erro || "Não foi possível entrar.");
    gravar(sessionStorage, CHAVE_TOKEN, corpo.token);
    gravar(sessionStorage, CHAVE_USUARIO, JSON.stringify(corpo.usuario));
    return normalizar(corpo.usuario);
  }

  function sair() {
    gravar(sessionStorage, CHAVE_TOKEN, null);
    gravar(sessionStorage, CHAVE_USUARIO, null);
  }

  return { usuarioAtual, token, entrar, sair, perfilDemo, definirPerfilDemo };
})();

const Permissoes = {
  // Repositório: qualquer usuário autenticado (RF03)
  podeVerRepositorio(usuario) {
    return Boolean(usuario);
  },

  // Área do monitor: monitor ou administrador
  podeGerenciar(usuario) {
    return Boolean(usuario) && (usuario.perfil === "monitor" || usuario.perfil === "admin");
  },

  // Editar/excluir: segue a regra do Back-End (routes/*.routes.js),
  // em que qualquer monitor ou o administrador pode alterar qualquer conteúdo.
  // Se o grupo decidir que o monitor só altera o que cadastrou, troque por:
  //   return usuario.perfil === "admin" || item.criadoPor.id === usuario.id;
  podeEditar(usuario, item) {
    return this.podeGerenciar(usuario) && Boolean(item);
  },
};
