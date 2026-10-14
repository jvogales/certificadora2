/* =========================================================
   DADOS SIMULADOS (fictícios, apenas para desenvolvimento)

   Estão no MESMO formato das tabelas do banco do grupo
   (database/talkflix_create-table.sql) e do que a API devolve:
   nomes em snake_case e tipos em maiúsculas. Assim, o código
   que converte os dados da API (api.js) é testado também no
   modo simulado.

   Os primeiros registros são os de database/talkflix_mock-insert.sql;
   os demais foram acrescentados para a tela ter mais exemplos.
   ========================================================= */

const MOCK_USUARIOS = [
  { user_id: 1, login: "fabio.professor", nome: "Fábio Fernandes da Rocha Vicente", perfil: "ADMIN" },
  { user_id: 2, login: "maria.monitor", nome: "Maria Luiza Parischi Fogaça", perfil: "MONITOR" },
  { user_id: 3, login: "lucas.monitor", nome: "Lucas Vieira Pagnan", perfil: "MONITOR" },
  { user_id: 4, login: "larissa.aluna", nome: "Larissa Cortez", perfil: "ALUNO" },
  { user_id: 5, login: "joaopaulo.aluno", nome: "João Paulo Barros", perfil: "ALUNO" },
  { user_id: 6, login: "joaovitor.aluno", nome: "João Vitor Gales", perfil: "ALUNO" },
];

// Tabela referencia_audiovisual
const MOCK_REFERENCIAS = [
  {
    ref_id: 1, titulo: "Friends", tipo: "SERIE", ano: 1994,
    trecho: "Cena do café Central Perk, min. 5:00-8:30", autor_artista: "David Crane e Marta Kauffman",
    temporada: 1, episodio: 1, plataforma_fonte: "HBO Max", link_fonte: "https://www.hbomax.com/friends",
    descricao: "Diálogo introdutório entre os personagens, vocabulário do cotidiano.",
    id_monitor: 2, data_cadastro: "2026-08-15T10:00:00",
  },
  {
    ref_id: 2, titulo: "Forrest Gump", tipo: "FILME", ano: 1994,
    trecho: "Cena do banco de praça, min. 0:00-4:00", autor_artista: "Robert Zemeckis",
    temporada: null, episodio: null, plataforma_fonte: "Netflix", link_fonte: "https://www.netflix.com/title/forrestgump",
    descricao: "Narração em primeira pessoa, bom para prática de passado simples.",
    id_monitor: 2, data_cadastro: "2026-08-22T14:30:00",
  },
  {
    ref_id: 3, titulo: "Imagine", tipo: "MUSICA", ano: 1971,
    trecho: "Primeira estrofe e refrão", autor_artista: "John Lennon",
    temporada: null, episodio: null, plataforma_fonte: "Spotify", link_fonte: "https://open.spotify.com/track/imagine",
    descricao: "Vocabulário simples, ideal para iniciantes.",
    id_monitor: 3, data_cadastro: "2026-08-30T09:15:00",
  },
  {
    ref_id: 4, titulo: "Sherlock", tipo: "SERIE", ano: 2010,
    trecho: "Primeiro encontro dos protagonistas no laboratório", autor_artista: null,
    temporada: 1, episodio: 1, plataforma_fonte: "Prime Video", link_fonte: null,
    descricao: "Diálogos rápidos e vocabulário de dedução; bom para treinar escuta do sotaque britânico.",
    id_monitor: 3, data_cadastro: "2026-09-05T16:00:00",
  },
  {
    ref_id: 5, titulo: "Up", tipo: "FILME", ano: 2009,
    trecho: "Sequência de abertura (primeiros 10 minutos)", autor_artista: null,
    temporada: null, episodio: null, plataforma_fonte: "Disney+", link_fonte: null,
    descricao: "Narrativa visual com poucas falas; ótimo para descrever cenas e sentimentos.",
    id_monitor: 2, data_cadastro: "2026-09-12T11:20:00",
  },
  {
    ref_id: 6, titulo: "Inside the mind of a master procrastinator", tipo: "OUTRO", ano: 2016,
    trecho: "Palestra completa (14 min)", autor_artista: "Tim Urban",
    temporada: null, episodio: null, plataforma_fonte: "TED.com",
    link_fonte: "https://www.ted.com/talks/tim_urban_inside_the_mind_of_a_master_procrastinator",
    descricao: "Palestra bem-humorada sobre procrastinação; base para debate em grupo.",
    id_monitor: 3, data_cadastro: "2026-10-02T13:00:00",
  },
];

// Tabela conteudo_pdf (tipo ATIVIDADE ou MATERIAL)
const MOCK_CONTEUDOS_PDF = [
  {
    conteudo_id: 1, tipo: "ATIVIDADE", titulo: "Atividade - Friends T1E1",
    descricao: "Perguntas de interpretação e vocabulário sobre a cena do café.",
    arquivo_url: "/arquivos/atividades/friends_t1e1.pdf", id_monitor_criador: 2, id_ref_audio: 1,
    data_cadastro: "2026-08-19T20:00:00",
  },
  {
    conteudo_id: 2, tipo: "ATIVIDADE", titulo: "Atividade - Forrest Gump",
    descricao: "Exercício de passado simples baseado na narração do filme.",
    arquivo_url: "/arquivos/atividades/forrest_gump.pdf", id_monitor_criador: 2, id_ref_audio: 2,
    data_cadastro: "2026-08-25T12:00:00",
  },
  {
    conteudo_id: 3, tipo: "ATIVIDADE", titulo: "Atividade - Imagine",
    descricao: "Completar lacunas da letra e exercício de pronúncia.",
    arquivo_url: "/arquivos/atividades/imagine.pdf", id_monitor_criador: 3, id_ref_audio: 3,
    data_cadastro: "2026-09-01T09:30:00",
  },
  {
    conteudo_id: 4, tipo: "MATERIAL", titulo: "Glossário - Expressões idiomáticas em Friends",
    descricao: "Lista de expressões usadas na série com tradução e exemplos.",
    arquivo_url: "/arquivos/materiais/glossario_friends.pdf", id_monitor_criador: 2, id_ref_audio: 1,
    data_cadastro: "2026-08-18T09:00:00",
  },
  {
    conteudo_id: 5, tipo: "MATERIAL", titulo: "Guia de pronúncia - Imagine",
    descricao: "Transcrição fonética de trechos da música.",
    arquivo_url: "/arquivos/materiais/guia_pronuncia_imagine.pdf", id_monitor_criador: 3, id_ref_audio: 3,
    data_cadastro: "2026-09-02T15:20:00",
  },
  {
    conteudo_id: 6, tipo: "ATIVIDADE", titulo: "Atividade - Debate sobre procrastinação",
    descricao: "Roteiro de debate em duplas com perguntas abertas sobre a palestra.",
    arquivo_url: "/arquivos/atividades/debate_procrastinacao.pdf", id_monitor_criador: 3, id_ref_audio: 6,
    data_cadastro: "2026-10-03T18:30:00",
  },
];

// Tabela conclusao_atividade (id_aluno, id_atividade)
const MOCK_CONCLUSOES = [
  { id_aluno: 4, id_atividade: 1 },
  { id_aluno: 4, id_atividade: 2 },
  { id_aluno: 5, id_atividade: 1 },
  { id_aluno: 6, id_atividade: 3 },
];
