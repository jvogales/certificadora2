/* =========================================================
   TELA DE ENTRADA (index.html)
   Modo simulado: escolhe um perfil de teste.
   Modo real: login em POST /api/auth/login.
   Depois do acesso, aluno vai para o repositório e
   monitor/administrador vão para a área do monitor.
   ========================================================= */

(() => {
  document.getElementById("logo-icone").innerHTML = Icones.play;
  ["ic-1", "ic-2", "ic-3"].forEach((id, i) => {
    document.getElementById(id).outerHTML = [Icones.serie, Icones.pdf, Icones.monitor][i];
  });

  const area = document.getElementById("area-acesso");

  function destinoDoPerfil(perfil) {
    return perfil === "aluno" ? "pages/repositorio.html" : "pages/monitor.html";
  }

  /* ---------- Modo simulado: escolha de perfil ---------- */

  if (CONFIG.USAR_MOCK) {
    const PERFIS = [
      { chave: "aluno", id: 5, papel: "Aluno · vê o repositório" },
      { chave: "monitorMaria", id: 2, papel: "Monitora · gerencia conteúdos" },
      { chave: "monitorLucas", id: 3, papel: "Monitor · gerencia conteúdos" },
      { chave: "admin", id: 1, papel: "Administrador · acesso total" },
    ];

    area.innerHTML = `
      <p class="muted">Escolha um perfil para explorar a plataforma:</p>
      <div class="perfis">
        ${PERFIS.map((p) => {
          const u = MOCK_USUARIOS.find((x) => x.user_id === p.id);
          return `<button class="perfil" data-perfil="${p.chave}" data-tipo="${u.perfil.toLowerCase()}">
                    <span class="avatar" aria-hidden="true">${escaparHtml(u.nome[0])}</span>
                    <span><span class="perfil__nome">${escaparHtml(u.nome)}</span><span class="perfil__papel">${p.papel}</span></span>
                    <span class="perfil__seta">${Icones.seta}</span>
                  </button>`;
        }).join("")}
      </div>
      <p class="aviso-demo">Modo de demonstração: os dados são fictícios e as alterações ficam salvas só neste navegador.</p>`;

    area.addEventListener("click", (e) => {
      const botao = e.target.closest("[data-perfil]");
      if (!botao) return;
      Sessao.definirPerfilDemo(botao.dataset.perfil);
      location.href = destinoDoPerfil(botao.dataset.tipo);
    });
    return;
  }

  /* ---------- Modo real: login ---------- */

  const atual = Sessao.usuarioAtual();
  if (atual) {
    area.innerHTML = `
      <p class="muted">Você já está conectado como <strong>${escaparHtml(atual.nome)}</strong>.</p>
      <a class="btn btn--primary" href="${destinoDoPerfil(atual.perfil)}">Continuar</a>
      <button class="btn btn--ghost" id="btn-trocar">Entrar com outra conta</button>`;
    document.getElementById("btn-trocar").addEventListener("click", () => {
      Sessao.sair();
      location.reload();
    });
    return;
  }

  area.innerHTML = `
    <p class="muted">Use o login e a senha cadastrados pela coordenação do projeto.</p>
    <form id="form-entrar" novalidate>
      <div class="field">
        <label class="field__label" for="entrar-login">Login</label>
        <input class="input" id="entrar-login" autocomplete="username" />
      </div>
      <div class="field">
        <label class="field__label" for="entrar-senha">Senha</label>
        <input class="input" id="entrar-senha" type="password" autocomplete="current-password" />
      </div>
      <span class="field__error" id="entrar-erro" role="alert"></span>
      <button class="btn btn--primary" type="submit">Entrar</button>
    </form>`;

  const form = document.getElementById("form-entrar");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const login = document.getElementById("entrar-login").value.trim();
    const senha = document.getElementById("entrar-senha").value;
    const erro = document.getElementById("entrar-erro");
    if (!login || !senha) {
      erro.textContent = "Informe o login e a senha.";
      return;
    }
    const botao = form.querySelector("button");
    botao.disabled = true;
    botao.textContent = "Entrando...";
    try {
      const usuario = await Sessao.entrar(login, senha);
      location.href = destinoDoPerfil(usuario.perfil);
    } catch (falha) {
      erro.textContent = falha.message;
      botao.disabled = false;
      botao.textContent = "Entrar";
    }
  });
})();
