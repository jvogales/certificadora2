# Talkflix — Backend
 
API da plataforma web Talkflix, projeto de extensão da UTFPR voltado para
aulas de conversação em inglês apoiadas em conteúdo audiovisual.

## 1. Visão geral do projeto
 
A plataforma Talkflix organiza três tipos de usuário:
 
| Perfil | Quem é | O que faz |
|---|---|---|
| **Administrador** | O professor/coordenador do projeto (único) | Cadastra e remove usuários; supervisiona todo o conteúdo |
| **Monitor** | Integrante responsável pelo projeto | Cadastra referências audiovisuais, materiais de aula e atividades; acompanha o progresso dos alunos |
| **Aluno** | Participante do projeto | Consulta o repositório, baixa atividades/materiais, marca atividades como concluídas, acompanha o próprio progresso |
 
O sistema **não armazena** os conteúdos audiovisuais (filmes, séries, músicas) nem os arquivos PDF em si — apenas as **referências** (metadados) e **links** de acesso a esses conteúdos, hospedados externamente (ex: Google Drive, plataformas de streaming).
 
As atividades são resolvidas **fora da plataforma** (o aluno baixa o PDF, responde por conta própria, e depois marca manualmente como concluída no sistema). Não há correção automática, nota ou registro de respostas. O "progresso" representa apenas a participação declarada, não o desempenho.
 
---
## 2. Arquitetura do backend
 
Construído em **Node.js + Express**, com **PostgreSQL** como banco de dados, seguindo uma arquitetura em camadas:
 
```
Requisição HTTP
      ↓
   routes        → define qual URL/método chama qual função
      ↓
 controllers     → recebe a requisição, valida entrada, chama o service
      ↓
  services       → regra de negócio (permissões de uso, validações, hashing)
      ↓
repositories     → executa as queries SQL, isolado do resto da aplicação
      ↓
PostgreSQL
```
 
```
backend/
├── src/
│   ├── routes/          # uma URL -> uma função do controller
│   ├── controllers/     # recebe req/res, chama o service
│   ├── services/        # regra de negócio
│   ├── repositories/    # queries SQL
│   ├── middlewares/     # autenticação (JWT) e controle de permissão
│   ├── db/pool.js       # conexão com o PostgreSQL
│   └── app.js           # configuração do Express e registro das rotas
├── server.js            # ponto de entrada
├── .env.example         # modelo de variáveis de ambiente (sem dados reais)
└── database/
    ├── talkflix_schema.sql   # criação das tabelas
    └── talkflix_seed.sql     # dados de teste
```
 
---
## 3. Como rodar localmente
 
1. Tenha o PostgreSQL instalado e rodando, com o banco criado a partir de
   `database/talkflix_schema.sql` (e, se quiser dados de exemplo,
   `database/talkflix_seed.sql`).
2. Instale as dependências:
```
   npm install
```
 
3. Copie o modelo de variáveis de ambiente (.env.exemple) e preencha com os dados reais:
```
   copy .env.example .env
```
```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=talkflix
   DB_USER=postgres
   DB_PASSWORD=sua_senha_aqui
   PORT=3000
   JWT_SECRET=troque_por_uma_frase_bem_grande_e_aleatoria
   JWT_EXPIRES_IN=8h
```
 
4. Suba o servidor:
```
   node server.js
```
   Deve aparecer: `Talkflix API rodando em http://localhost:3000`
 
5. Teste se está no ar (em outro terminal):
```
   GET http://localhost:3000/api/health  →  {"status":"ok"}
```
 
---
 
## 4. Autenticação — como o front-end deve se conectar
 
A API usa **JWT (JSON Web Token)**. O fluxo é:
 
1. O front-end envia `login` e `senha` para `POST /api/auth/login`
2. A API responde com um `token` e os dados básicos do usuário
3. O front-end **guarda esse token** e o envia em **todas as próximas
   requisições a rotas protegidas**, no cabeçalho:
```
   Authorization: Bearer <token>
```
4. Se o token não for enviado, estiver expirado ou for inválido, a API
   responde `401 Unauthorized`
5. Se o token for válido mas o perfil do usuário não tiver permissão para
   aquela ação, a API responde `403 Forbidden`
O token expira em 8 horas (configurável). Quando expirar, o front-end
precisa levar o usuário de volta para a tela de login.
 
**Exemplo de login:**
```http
POST /api/auth/login
Content-Type: application/json
 
{ "login": "2648164", "senha": "senha123" }
```
 
**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "userId": 4,
    "nome": "Larissa Cortez",
    "perfil": "ALUNO"
  }
}
```
 
O front-end deve guardar o `perfil` retornado para decidir quais telas e
botões mostrar (ex: só Monitor/Admin veem o botão "Cadastrar atividade").
 
---
 
## 5. Rotas disponíveis
 
### 5.1 Pública (sem autenticação)
 
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | Confirma que a API está no ar |
| POST | `/api/interessados` | Cadastra e-mail para receber notificações de novas turmas |
| POST | `/api/auth/login` | Autentica e retorna um token JWT |
 
**Cadastrar interessado:**
```http
POST /api/interessados
Content-Type: application/json
 
{ "email": "fulana@gmail.com", "nome": "Fulana", "matricula": null }
```
Retorna `400` se o e-mail já estiver cadastrado ou for inválido.
 
---
 
### 5.2 Usuários — apenas `ADMIN`
 
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/usuarios` | Cadastra aluno ou monitor |
| GET | `/api/usuarios` | Lista todos os usuários |
| DELETE | `/api/usuarios/:id` | Remove (inativa) um usuário |
 
**Cadastrar usuário:**
```http
POST /api/usuarios
Authorization: Bearer <token_do_admin>
Content-Type: application/json
 
{ "nome": "Larissa Cortez", "login": "2648164", "senha": "senha123", "perfil": "ALUNO" }
```
`perfil` aceita: `"ADMIN"`, `"MONITOR"` ou `"ALUNO"`.
 
A remoção **não apaga** o usuário do banco (soft delete) — apenas marca
como inativo, preservando o histórico de conteúdos e conclusões já
vinculados a ele.
 
---
 
### 5.3 Referências audiovisuais — leitura para todos autenticados, escrita para `MONITOR`/`ADMIN`
 
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/referencias` | Lista referências (filtros opcionais: `?tipo=&ano=`) |
| GET | `/api/referencias/:id` | Busca uma referência específica |
| POST | `/api/referencias` | Cadastra uma nova referência |
| PUT | `/api/referencias/:id` | Edita uma referência (qualquer monitor pode editar, não só quem criou) |
| DELETE | `/api/referencias/:id` | Exclui (falha se houver conteúdo vinculado) |
 
`tipo` aceita: `"SERIE"`, `"FILME"`, `"MUSICA"` ou `"OUTRO"`. Os campos
obrigatórios mudam conforme o tipo:
 
- **SERIE** exige `temporada` e `episodio`
- **MUSICA** exige `autorArtista`
- **FILME** e **OUTRO** não exigem nenhum dos dois
**Cadastrar uma referência (série):**
```http
POST /api/referencias
Authorization: Bearer <token_de_monitor_ou_admin>
Content-Type: application/json
 
{
  "titulo": "Friends",
  "tipo": "SERIE",
  "ano": 1994,
  "temporada": 1,
  "episodio": 1,
  "trecho": "Cena do café Central Perk",
  "plataformaFonte": "HBO Max",
  "linkFonte": "https://www.hbomax.com/friends",
  "descricao": "Diálogo introdutório, vocabulário do cotidiano"
}
```
 
---
 
### 5.4 Conteúdo PDF (atividades e materiais de aula) — leitura para todos autenticados, escrita para `MONITOR`/`ADMIN`
 
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/conteudos` | Lista conteúdos (filtros opcionais: `?tipo=&refAudioId=`) |
| GET | `/api/conteudos/:id` | Busca um conteúdo específico |
| POST | `/api/conteudos` | Cadastra atividade ou material |
| PUT | `/api/conteudos/:id` | Edita um conteúdo (qualquer monitor pode editar) |
| DELETE | `/api/conteudos/:id` | Exclui (falha se houver conclusões vinculadas) |
 
`tipo` aceita `"ATIVIDADE"` ou `"MATERIAL"`. **Todo conteúdo precisa estar
vinculado a uma referência audiovisual já cadastrada** (`idRefAudio`) — o
cadastro falha se a referência não existir.
 
**Importante para o front:** `arquivoUrl` é um **link externo** (ex: link
do Google Drive), não um upload de arquivo para o servidor. A plataforma
não armazena o PDF em si, só o link de acesso a ele.
 
**Cadastrar uma atividade:**
```http
POST /api/conteudos
Authorization: Bearer <token_de_monitor_ou_admin>
Content-Type: application/json
 
{
  "tipo": "ATIVIDADE",
  "titulo": "Atividade - Friends T1E1",
  "descricao": "Perguntas de interpretação sobre a cena do café",
  "arquivoUrl": "https://drive.google.com/file/d/xxxxx/view",
  "idRefAudio": 1
}
```
 
---
 
### 5.5 Progresso
 
| Método | Rota | Perfil | Descrição |
|---|---|---|---|
| POST | `/api/progresso/:atividadeId/concluir` | ALUNO | Marca uma atividade como concluída |
| DELETE | `/api/progresso/:atividadeId/concluir` | ALUNO | Desfaz uma marcação (ex: clique por engano) |
| GET | `/api/progresso/meu` | ALUNO | Consulta o próprio progresso |
| GET | `/api/progresso/aluno/:alunoId` | MONITOR, ADMIN | Consulta o progresso de um aluno específico |
 
Regras importantes:
- Só é possível marcar conteúdo do tipo **ATIVIDADE** como concluído —
  **MATERIAL** nunca entra nesse cálculo (retorna erro `400` se tentado)
- Uma atividade não pode ser marcada duas vezes seguidas pelo mesmo aluno
  (retorna erro `400`), mas pode ser desmarcada e remarcada livremente
- O progresso é sempre recalculado dinamicamente: **(atividades
  concluídas / atividades disponíveis) × 100**
**Marcar como concluída:**
```http
POST /api/progresso/3/concluir
Authorization: Bearer <token_do_aluno>
```
 
**Consultar o próprio progresso:**
```http
GET /api/progresso/meu
Authorization: Bearer <token_do_aluno>
```
```json
{
  "atividadesConcluidas": 2,
  "atividadesDisponiveis": 5,
  "percentual": 40,
  "historico": [
    { "conclusao_id": 7, "data_conclusao": "...", "conteudo_id": 3, "titulo": "Atividade - Friends T1E1" },
    { "conclusao_id": 9, "data_conclusao": "...", "conteudo_id": 5, "titulo": "Atividade - Imagine" }
  ]
}
```
 
---
## 6. Segurança
 
- Senhas nunca são armazenadas em texto puro — são salvas com hash via
  `bcrypt` antes de ir para o banco
- O arquivo `.env` (com senha do banco e segredo do JWT) nunca é commitado
  — apenas `.env.example`, sem valores reais
- Toda rota de escrita valida o perfil do usuário autenticado antes de
  executar qualquer ação (middleware `exigirPerfil`)
- Remoção de usuários é feita por soft delete (`ativo = false`), nunca por
  exclusão física, preservando a integridade do histórico de conteúdos e
  conclusões já registrados
