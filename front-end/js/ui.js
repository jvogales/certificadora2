/* =========================================================
   UTILITÁRIOS DE INTERFACE
   Rótulos, ícones, formatação, layout (navbar + barra lateral),
   pop-ups (modal) e avisos (toast). Usado pelas duas páginas.
   ========================================================= */

const Rotulos = {
  categoria: {
    referencia: "Referência audiovisual",
    material: "Material de aula",
    atividade: "Atividade",
  },
  categoriaPlural: {
    todos: "Todos",
    referencia: "Referências audiovisuais",
    material: "Materiais de aula",
    atividade: "Atividades",
  },
  tipo: { serie: "Série", filme: "Filme", musica: "Música", outro: "Outro" },
  perfil: { aluno: "Aluno", monitor: "Monitor", admin: "Administrador" },
};

/* Ícones em SVG (traço, no estilo dos ícones do Figma) */
const Icones = (() => {
  const svg = (conteudo) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${conteudo}</svg>`;
  return {
    play: `<svg viewBox="0 0 24 24" fill="#f7f7f2" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg>`,
    busca: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    serie: svg('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="m8 2 4 4 4-4"/>'),
    filme: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4M3 12h18"/>'),
    musica: svg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
    outro: svg('<path d="M12 3l1.9 4.8L19 9.5l-4 3.4 1.2 5.1L12 15.3 7.8 18l1.2-5.1-4-3.4 5.1-1.7z"/>'),
    pdf: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
    atividade: svg('<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M9 2h6v4H9zM8.5 13l2.5 2.5 4.5-5"/>'),
    download: svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
    externo: svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
    fechar: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
    mais: svg('<path d="M12 5v14M5 12h14"/>'),
    editar: svg('<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>'),
    lixeira: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    cadeado: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    inicio: svg('<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>'),
    repositorio: svg('<path d="M4 19V5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M8 13h8M8 17h5"/>'),
    monitor: svg('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
    admin: svg('<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
    usuarios: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 5.5 5"/>'),
    calendario: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    local: svg('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    usuario: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    menu: svg('<path d="M4 6h16M4 12h16M4 18h16"/>'),
    upload: svg('<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>'),
    sair: svg('<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11"/>'),
    vazio: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8.5 11h5"/>'),
    alerta: svg('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>'),
    seta: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    check: svg('<path d="m5 12 5 5 9-10"/>'),
  };
})();

const Formatar = {
  // "2026-09-10" -> "10/09/2026"
  data(iso) {
    if (!iso) return "—";
    const [ano, mes, dia] = iso.slice(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
  },

  // 482304 -> "471 KB"
  tamanho(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1).replace(".", ",") + " MB";
  },

  // Temporada 2, episódio 1 -> "T2 · E1"
  episodio(item) {
    if (!item.temporada && !item.episodio) return "";
    return `T${item.temporada || "?"} · E${item.episodio || "?"}`;
  },
};

// Evita que texto digitado pelo usuário vire HTML (proteção contra XSS)
function escaparHtml(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Executa a função só depois que o usuário para de digitar por "ms" milissegundos
function debounce(funcao, ms) {
  let temporizador;
  return (...args) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => funcao(...args), ms);
  };
}

const UI = (() => {
  /* -------- Layout: navbar + barra lateral -------- */

  // Links da barra lateral. As páginas dos colegas ainda serão criadas;
  // os nomes de arquivo abaixo são a sugestão de padrão para o grupo.
  const LINKS = [
    { id: "aluno", rotulo: "Meu painel", href: "aluno.html", icone: "inicio", perfis: ["aluno"] },
    { id: "repositorio", rotulo: "Repositório", href: "repositorio.html", icone: "repositorio", perfis: ["aluno", "monitor", "admin"] },
    { id: "atividades", rotulo: "Atividades", href: "atividades.html", icone: "atividade", perfis: ["aluno", "monitor", "admin"] },
    { id: "monitor", rotulo: "Área do monitor", href: "monitor.html", icone: "monitor", perfis: ["monitor", "admin"] },
    { id: "admin", rotulo: "Administração", href: "admin.html", icone: "admin", perfis: ["admin"] },
  ];

  function montarLayout(paginaAtiva) {
    const usuario = Sessao.usuarioAtual();

    const seletorDemo = CONFIG.USAR_MOCK
      ? `<label class="demo-bar" title="Apenas para testes: simula o perfil do usuário logado">
           <span>Ver como</span>
           <select id="seletor-perfil" aria-label="Simular perfil do usuário">
             <option value="aluno">Aluno (João Paulo)</option>
             <option value="monitorMaria">Monitora (Maria Luiza)</option>
             <option value="monitorLucas">Monitor (Lucas)</option>
             <option value="admin">Administrador (Fábio)</option>
           </select>
         </label>`
      : "";

    document.getElementById("navbar").innerHTML = `
      <div class="navbar__left">
        <button class="btn btn--ghost btn--icon menu-toggle" id="btn-menu" aria-label="Abrir menu">${Icones.menu}</button>
        <a class="logo" href="../index.html" aria-label="Talkflix UTFPR, página inicial">
          <span class="logo__icon">${Icones.play}</span>
          <span class="logo__brand">
            <span class="logo__name">Talkflix</span>
            <span class="logo__sub">UTFPR</span>
          </span>
        </a>
      </div>
      <div class="user-area">
        ${seletorDemo}
        <div class="user-area__text">
          <span class="user-area__name">${escaparHtml(usuario ? usuario.nome : "Visitante")}</span>
          <span class="user-area__role">${usuario ? Rotulos.perfil[usuario.perfil] : ""}</span>
        </div>
        <span class="avatar" aria-hidden="true">${escaparHtml(usuario ? usuario.nome[0] : "?")}</span>
      </div>`;

    const links = LINKS.filter((l) => usuario && l.perfis.includes(usuario.perfil))
      .map(
        (l) => `<a class="sidebar__link" href="${l.href}" ${l.id === paginaAtiva ? 'aria-current="page"' : ""}>
                  ${Icones[l.icone]}<span>${l.rotulo}</span></a>`
      )
      .join("");

    document.getElementById("sidebar").innerHTML = `
      <div class="sidebar__label">Navegação</div>
      ${links}
      <div class="sidebar__footer">
        <a class="sidebar__link" href="../index.html" id="link-sair">${Icones.sair}<span>Sair</span></a>
      </div>`;

    const seletor = document.getElementById("seletor-perfil");
    if (seletor) {
      seletor.value = Sessao.perfilDemo();
      seletor.addEventListener("change", () => {
        Sessao.definirPerfilDemo(seletor.value);
        location.reload();
      });
    }

    // Sair apaga o token salvo no navegador
    document.getElementById("link-sair").addEventListener("click", () => Sessao.sair());

    const sidebar = document.getElementById("sidebar");
    document.getElementById("btn-menu").addEventListener("click", () => sidebar.classList.toggle("is-open"));

    return usuario;
  }

  /* -------- Pop-up (modal) -------- */

  let ultimoFoco = null;

  function abrirModal(id) {
    const modal = document.getElementById(id);
    ultimoFoco = document.activeElement;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    const focavel = modal.querySelector("input, select, textarea, button:not(.modal__close)") || modal.querySelector("button");
    if (focavel) setTimeout(() => focavel.focus(), 30);
  }

  function fecharModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove("is-open");
    if (!document.querySelector(".modal.is-open")) document.body.style.overflow = "";
    if (ultimoFoco) ultimoFoco.focus();
  }

  // Fecha ao clicar fora da caixa, no botão [data-fechar] ou com a tecla Esc
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) fecharModal(e.target.id);
    const botao = e.target.closest("[data-fechar]");
    if (botao) fecharModal(botao.dataset.fechar);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const abertos = document.querySelectorAll(".modal.is-open");
    if (abertos.length) fecharModal(abertos[abertos.length - 1].id);
  });

  /* -------- Avisos (toast) -------- */

  function aviso(mensagem, tipo = "info") {
    let area = document.querySelector(".toast-area");
    if (!area) {
      area = document.createElement("div");
      area.className = "toast-area";
      area.setAttribute("role", "status");
      area.setAttribute("aria-live", "polite");
      document.body.appendChild(area);
    }
    const toast = document.createElement("div");
    toast.className = `toast toast--${tipo}`;
    toast.textContent = mensagem;
    area.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  /* -------- Pedaços de HTML reutilizados -------- */

  // Ícone que representa o conteúdo: tipo de mídia ou PDF
  function iconeDoItem(item) {
    if (item.categoria === "referencia") return Icones[item.tipo] || Icones.outro;
    if (item.categoria === "atividade") return Icones.atividade;
    return Icones.pdf;
  }

  function rotuloDoItem(item) {
    if (item.categoria === "referencia") return Rotulos.tipo[item.tipo] || "Outro";
    return Rotulos.categoria[item.categoria];
  }

  function telaSemAcesso(mensagem) {
    return `<div class="panel empty">${Icones.cadeado}<h3>Acesso restrito</h3><p>${escaparHtml(mensagem)}</p></div>`;
  }

  /* Login para quando a página é aberta direto, sem passar pela página inicial
     (modo real). Usa o mesmo POST /api/auth/login do pop-up da página inicial. */
  function mostrarLogin(elemento) {
    elemento.innerHTML = `
      <form class="panel login-box" id="form-login" novalidate>
        <span class="logo__icon">${Icones.play}</span>
        <h1>Entrar no Talkflix</h1>
        <p class="muted">Use o login e a senha cadastrados pela coordenação.</p>
        <div class="field">
          <label class="field__label" for="login-usuario">Login</label>
          <input class="input" id="login-usuario" autocomplete="username" required />
        </div>
        <div class="field">
          <label class="field__label" for="login-senha">Senha</label>
          <input class="input" id="login-senha" type="password" autocomplete="current-password" required />
        </div>
        <span class="field__error" id="login-erro" role="alert"></span>
        <button class="btn btn--primary" type="submit">Entrar</button>
      </form>`;
    const form = document.getElementById("form-login");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const botao = form.querySelector("button");
      botao.disabled = true;
      try {
        await Sessao.entrar(form.querySelector("#login-usuario").value.trim(), form.querySelector("#login-senha").value);
        location.reload();
      } catch (erro) {
        document.getElementById("login-erro").textContent = erro.message;
        botao.disabled = false;
      }
    });
  }

  return { montarLayout, abrirModal, fecharModal, aviso, iconeDoItem, rotuloDoItem, telaSemAcesso, mostrarLogin };
})();
