# Talkflix

Plataforma web para o projeto de extensão de conversação em inglês com
séries de TV, desenvolvido pela UTFPR — Câmpus Cornélio Procópio.

> Disciplina: Certificadora de Competência 2 (EC46H) — Turma C61
> Professor: Fábio Fernandes da Rocha Vicente

---

## Sobre o projeto

O **Talkflix** é um projeto de extensão que promove a prática de conversação
em inglês usando séries, filmes e músicas como apoio pedagógico. Até hoje,
o acesso aos materiais e às informações do projeto ficava restrito aos
encontros presenciais e às redes sociais institucionais.

Esta plataforma nasceu para resolver esse problema, oferecendo:

- Um canal público com informações sobre o projeto, horários e formas de
  participação
- Um acervo organizado com as referências dos conteúdos audiovisuais
  usados nas aulas
- Materiais de apoio e atividades em PDF, disponíveis para consulta e
  download
- Acompanhamento do progresso dos alunos ao longo da sua participação

A plataforma **não armazena** os filmes, séries ou músicas em si — apenas
as informações de referência (título, ano, trecho usado, onde encontrar)
e os links de acesso aos PDFs utilizados nas aulas.

---

## Quem usa a plataforma

| Perfil | O que pode fazer |
|---|---|
| **Visitante** | Consultar informações do projeto e se cadastrar para receber notificações sobre novas turmas |
| **Aluno** | Consultar o acervo, baixar atividades e materiais, marcar atividades como concluídas e acompanhar seu progresso |
| **Monitor** | Cadastrar e organizar referências, materiais e atividades |
| **Administrador** (o professor do projeto) | Cadastrar e gerenciar os usuários da plataforma e supervisionar todo o conteúdo |

As atividades são sempre realizadas **fora** da plataforma — o aluno baixa
o PDF, resolve por conta própria, e depois marca como concluída. Não há
correção automática nem atribuição de notas: o progresso mostrado
representa a participação declarada pelo aluno, não uma avaliação de
desempenho.

---

## Como o projeto está organizado

```
talkflix/
├── front-end/     → interface que o usuário acessa no navegador
├── backend/       → API que processa as regras do sistema
├── database/      → estrutura do banco de dados e dados de exemplo
└── docs/          → documentos de planejamento, requisitos e modelagem
```

- O **front-end** é a parte visual: páginas, botões, telas que o usuário
  interage.
- O **backend** é o "motor" por trás da plataforma: recebe as
  solicitações do front-end, aplica as regras do sistema (quem pode
  fazer o quê) e conversa com o banco de dados.
- O **banco de dados** guarda as informações de forma organizada:
  usuários, referências audiovisuais, materiais, atividades e o
  progresso de cada aluno.
- A pasta **docs** reúne o planejamento original do projeto, o
  levantamento de requisitos e o modelo de dados (diagrama ER).

---

## Equipe

| Integrante | Responsabilidade principal |
|---|---|
| Maria Luiza Parischi Fogaça | Banco de dados e backend |
| Larissa Cortez Pinheiro da Silva | Documentação e apoio ao design/frontend |
| João Vitor Orlandini Gales | Design e apoio ao frontend |
| Lucas Vieira Pagnan | Apresentação e apoio ao backend |
| João Paulo Gonçalves Barros | Frontend e pitch de apresentação |

---

## Tecnologias utilizadas

- **Front-end:** HTML, CSS e JavaScript
- **Back-end:** Node.js com Express
- **Banco de dados:** PostgreSQL
- **Prototipação:** Figma
- **Versionamento:** Git e GitHub

---

## Documentação complementar

Para detalhes técnicos sobre a API (rotas, autenticação, exemplos de uso),
consulte o `README.md` dentro da pasta `backend/`. Os documentos de
requisitos funcionais e o diagrama de modelagem do banco estão disponíveis
na pasta `docs/`.
