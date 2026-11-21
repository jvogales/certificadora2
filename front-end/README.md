# Front-end

Páginas em HTML, CSS e JavaScript puros (sem framework), seguindo o design system do Figma
(tema escuro, Barlow Condensed + Source Sans 3, escala de 8 px).

## Páginas

| Página | Arquivo | Quem acessa |
|---|---|---|
| Página inicial (divulgação, "Tenho interesse" e login) | `index.html` | todos |
| Meu painel | `pages/aluno.html` | aluno |
| Repositório de materiais | `pages/repositorio.html` | aluno, monitor, admin |
| Atividades | `pages/atividades.html` | aluno, monitor, admin |
| Área do monitor | `pages/monitor.html` | monitor, admin |
| Administração de usuários | `pages/admin.html` | admin |

Depois do login, o aluno vai para o **Meu painel**, o monitor para a **Área do monitor** e o
administrador para a **Administração**.

## Como abrir

O modo é escolhido sozinho, em `js/config.js`:

- **Com o Back-End (modo real):** na pasta `backend/`, rode `npm start` e abra
  **http://localhost:3000**. O servidor entrega este site e as telas usam a API e o banco
  PostgreSQL. Usuários de exemplo: `fabio.professor`, `maria.monitor`, `larissa.aluna`
  (senha `TalkflixDemo2026!`).
- **Sem servidor (modo de demonstração):** dê dois cliques em `index.html`. Os dados vêm de
  `js/mock-dados.js` (mesmo formato do banco) e as alterações ficam salvas só no navegador.
  Em "Entrar", escolha um perfil de teste.

Para voltar os dados de demonstração ao início, abra o console (F12) e rode
`Api.restaurarMock(); location.reload();`

## Integração com o Back-End

Toda a comunicação fica em `js/api.js`. As páginas nunca chamam `fetch` diretamente.

| Ação na tela | Rota do Back-End |
|---|---|
| Login | `POST /api/auth/login` |
| Listar o repositório e as atividades | `GET /api/referencias` + `GET /api/conteudos` |
| Cadastrar referência | `POST /api/referencias` |
| Cadastrar material ou atividade | `POST /api/conteudos` (`tipo`: `MATERIAL` ou `ATIVIDADE`) |
| Editar | `PUT /api/referencias/:id` ou `PUT /api/conteudos/:id` |
| Excluir | `DELETE /api/referencias/:id` ou `DELETE /api/conteudos/:id` |
| Meu progresso (aluno) | `GET /api/progresso/meu` |
| Marcar / desmarcar atividade (aluno) | `POST` / `DELETE /api/progresso/:atividadeId/concluir` |
| Progresso dos alunos (monitor e admin) | `GET /api/usuarios` + `GET /api/progresso/aluno/:id` |
| Usuários: listar, cadastrar, inativar | `GET`, `POST /api/usuarios`, `DELETE /api/usuarios/:id` |
| Tenho interesse (página inicial) | `POST /api/interessados` |

`GET /api/usuarios` aceita ADMIN e MONITOR (o monitor precisa da lista de alunos para ver o
progresso); cadastrar e inativar usuários continuam só com o ADMIN.

O `api.js` converte os dados do banco (`plataforma_fonte`, `link_fonte`, `arquivo_url`,
`id_ref_audio`...) para o formato usado nas telas, e o contrário ao salvar.

**Login:** o pop-up da página inicial chama `Sessao.entrar(login, senha)` (em `js/sessao.js`),
que guarda no `sessionStorage`:

- `talkflix-token`: o token JWT;
- `talkflix-usuario`: `{ userId, nome, perfil }`.

## Regras seguidas (requisitos revisados em 11/10)

- Materiais e atividades são **links** para PDFs hospedados fora (ex.: Google Drive); a plataforma não guarda os arquivos (RF05, RF06).
- Todo material ou atividade precisa estar ligado a uma referência audiovisual (regra do banco).
- Série exige temporada e episódio; música exige artista (mesma validação do Back-End).
- Uma referência com PDFs vinculados não pode ser excluída; uma atividade já concluída por algum aluno também não (regra do banco).
- Qualquer monitor ou o administrador pode editar e excluir conteúdos (mesma regra das rotas do Back-End).

## Estrutura

```
front-end/
├── index.html            página inicial (divulgação, interesse e login)
├── pages/
│   ├── aluno.html        Meu painel
│   ├── repositorio.html
│   ├── atividades.html
│   ├── monitor.html
│   └── admin.html
├── css/
│   ├── base.css          cores, fontes e espaçamentos do Figma
│   ├── layout.css        navbar + menu lateral
│   ├── components.css    botões, campos, pop-ups, avisos
│   ├── entrada.css       página inicial
│   ├── repositorio.css
│   ├── monitor.css
│   └── paineis.css       painel do aluno, atividades e administração
└── js/
    ├── config.js         escolhe o modo (real ou demonstração) e o endereço da API
    ├── mock-dados.js     dados de demonstração no formato do banco
    ├── api.js            toda a comunicação com o Back-End
    ├── sessao.js         login, usuário logado e permissões
    ├── busca.js          índice invertido, filtros e ordenação
    ├── validacao.js      validação dos formulários
    ├── ui.js             ícones, layout, menu, pop-ups, avisos
    ├── entrada.js        login da página inicial
    ├── landing.js        página inicial e "Tenho interesse"
    ├── aluno.js · repositorio.js · atividades.js · monitor.js · admin.js
```

## Algoritmos e estruturas de dados (seção 3.5 do planejamento)

1. **Índice invertido** (`busca.js`): um `Map` liga cada palavra a um `Set` com os ids dos conteúdos que a contêm. É montado uma vez; cada busca consulta o índice em vez de reler todos os textos.
2. **Busca por prefixo**: "sher" encontra "Sherlock".
3. **Interseção de conjuntos**: "imagine lennon" devolve só o que tem as duas palavras.
4. **Normalização de texto**: "musica" encontra "Música".
5. **Filtros combinados e ordenação** com funções comparadoras.
6. **Debounce**: a busca só roda quando o usuário para de digitar por 200 ms.
7. **Validação de dados** (`validacao.js`) e **controle de permissões por perfil** (`sessao.js`).
8. **Map de acesso rápido** (`porId`): abre os detalhes de um conteúdo sem percorrer a lista.
