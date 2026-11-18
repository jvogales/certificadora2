# Front-end

Páginas em HTML, CSS e JavaScript puros (sem framework), seguindo o design system do Figma
(tema escuro, Barlow Condensed + Source Sans 3, escala de 8 px).

## Páginas

| Página | Arquivo | Quem acessa | Responsável |
|---|---|---|---|
| Tela de entrada (login) | `index.html` | todos | João Paulo |
| Repositório de materiais | `pages/repositorio.html` | aluno, monitor, admin | João Paulo |
| Área do monitor | `pages/monitor.html` | monitor, admin | João Paulo |

No menu lateral, as páginas dos outros integrantes (área do aluno, atividades e administração)
aparecem como **"Em breve"**. Quando uma delas for criada, basta trocar `pronta: false` para
`pronta: true` na lista `LINKS` de `js/ui.js`.

## Como abrir

### Modo simulado (sem servidor)

Dê dois cliques em `index.html` e escolha um perfil (aluno, monitores ou administrador).
Funciona no computador e no celular. Os dados vêm de
`js/mock-dados.js`, que segue o mesmo formato das tabelas do banco
(`database/talkflix_create-table.sql`) e usa os registros de `database/talkflix_mock-insert.sql`.
O seletor **"Ver como"**, no topo, troca o usuário simulado (aluno, monitores, administrador).

Para voltar aos dados originais, abra o console do navegador (F12) e rode:

```js
Api.restaurarMock(); location.reload();
```

### Modo real (com o Back-End)

1. Suba o banco e o servidor seguindo `backend/README.md` (`npm install` e `npm start` dentro de `backend/`).
2. Em `js/config.js`, troque `USAR_MOCK: true` para `USAR_MOCK: false`.
3. Abra `index.html` e entre com um usuário cadastrado (login em `POST /api/auth/login`).

## Integração com o Back-End

Toda a comunicação fica em `js/api.js`. As páginas nunca chamam `fetch` diretamente.

| Ação na tela | Rota do Back-End |
|---|---|
| Listar o repositório | `GET /api/referencias` + `GET /api/conteudos` |
| Cadastrar referência | `POST /api/referencias` |
| Cadastrar material ou atividade | `POST /api/conteudos` (`tipo`: `MATERIAL` ou `ATIVIDADE`) |
| Editar | `PUT /api/referencias/:id` ou `PUT /api/conteudos/:id` |
| Excluir | `DELETE /api/referencias/:id` ou `DELETE /api/conteudos/:id` |
| Login | `POST /api/auth/login` |
| Progresso dos alunos (RF17) | `GET /api/usuarios` + `GET /api/progresso/aluno/:id` |

**Atenção:** no Back-End atual, `GET /api/usuarios` só aceita o perfil ADMIN. Por isso, a aba de
progresso funciona para o administrador; para o monitor, ela mostra um aviso até essa rota aceitar
também o perfil MONITOR.

O `api.js` converte os dados do banco (`plataforma_fonte`, `link_fonte`, `arquivo_url`,
`id_ref_audio`...) para o formato usado nas telas, e o contrário ao salvar.

**Login (para quem fizer a página inicial):** o pop-up de login pode chamar
`Sessao.entrar(login, senha)` (em `js/sessao.js`). Ela guarda no `sessionStorage`:

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
├── index.html            tela de entrada (escolha de perfil ou login)
├── pages/
│   ├── repositorio.html
│   └── monitor.html
├── css/
│   ├── base.css          cores, fontes e espaçamentos do Figma
│   ├── layout.css        navbar + menu lateral (pode ser usado pelas outras páginas)
│   ├── components.css    botões, campos, pop-ups, avisos
│   ├── entrada.css
│   ├── repositorio.css
│   └── monitor.css
└── js/
    ├── config.js         liga/desliga o modo simulado e define o endereço da API
    ├── mock-dados.js     dados simulados no formato do banco
    ├── api.js            comunicação com o Back-End
    ├── sessao.js         login, usuário logado e permissões
    ├── busca.js          índice invertido, filtros e ordenação
    ├── validacao.js      validação dos formulários
    ├── ui.js             ícones, layout, menu, pop-ups, avisos
    ├── entrada.js        lógica da tela de entrada
    ├── repositorio.js    lógica da página do repositório
    └── monitor.js        lógica da área do monitor
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
