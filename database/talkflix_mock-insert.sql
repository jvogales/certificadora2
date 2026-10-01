-- =========================================================
-- Usuários: 1 administrador, 2 monitores, 3 alunos
-- Obs.: a coluna "senha" aqui está em texto puro só para teste.
-- No back-end real, deve ser armazenado um hash (ex: bcrypt).
-- =========================================================
INSERT INTO usuario (nome, login, senha, perfil, ativo) VALUES
('Fábio Fernandes da Rocha Vicente', 'fabio.professor', 'senha123', 'ADMIN', TRUE),
('Maria Luiza Parischi Fogaça',      'maria.monitor',   'senha123', 'MONITOR', TRUE),
('Lucas Vieira Pagnan',              'lucas.monitor',   'senha123', 'MONITOR', TRUE),
('Larissa Cortez',                   'larissa.aluna',   'senha123', 'ALUNO', TRUE),
('João Paulo Barros',                'joaopaulo.aluno', 'senha123', 'ALUNO', TRUE),
('João Vitor Gales',                 'joaovitor.aluno', 'senha123', 'ALUNO', TRUE);

-- =========================================================
-- Interessados: pessoas de fora do projeto que pediram notificação
-- =========================================================
INSERT INTO interessados (email, nome, matricula) VALUES
('ana.visitante@gmail.com', 'Ana Souza', NULL),
('pedro.aluno@alunos.utfpr.edu.br', 'Pedro Lima', '2650011'),
('contato.externo@hotmail.com', 'Carla Mendes', NULL);

-- =========================================================
-- Referências audiovisuais: uma série, um filme e uma música
-- id_monitor aponta para os monitores cadastrados acima (ids 2 e 3)
-- =========================================================
INSERT INTO referencia_audiovisual
    (titulo, tipo, ano, trecho, autor_artista, temporada, episodio, plataforma_fonte, link_fonte, descricao, id_monitor)
VALUES
('Friends', 'SERIE', 1994, 'Cena do café Central Perk, min. 5:00-8:30', 'David Crane e Marta Kauffman', 1, 1,
    'HBO Max', 'https://www.hbomax.com/friends', 'Diálogo introdutório entre os personagens, vocabulário do cotidiano.', 2),

('Forrest Gump', 'FILME', 1994, 'Cena do banco de praça, min. 0:00-4:00', 'Robert Zemeckis', NULL, NULL,
    'Netflix', 'https://www.netflix.com/title/forrestgump', 'Narração em primeira pessoa, bom para prática de passado simples.', 2),

('Imagine', 'MUSICA', 1971, 'Primeira estrofe e refrão', 'John Lennon', NULL, NULL,
    'Spotify', 'https://open.spotify.com/track/imagine', 'Vocabulário simples, ideal para iniciantes.', 3);

-- =========================================================
-- Conteúdo PDF: atividades (com conclusão rastreada) e material de apoio
-- id_ref_audio aponta para as referências acima (ids 1, 2 e 3)
-- =========================================================
INSERT INTO conteudo_pdf
    (tipo, titulo, descricao, arquivo_url, id_monitor_criador, id_ref_audio)
VALUES
('ATIVIDADE', 'Atividade - Friends T1E1', 'Perguntas de interpretação e vocabulário sobre a cena do café.',
    '/arquivos/atividades/friends_t1e1.pdf', 2, 1),

('ATIVIDADE', 'Atividade - Forrest Gump', 'Exercício de passado simples baseado na narração do filme.',
    '/arquivos/atividades/forrest_gump.pdf', 2, 2),

('ATIVIDADE', 'Atividade - Imagine', 'Completar lacunas da letra e exercício de pronúncia.',
    '/arquivos/atividades/imagine.pdf', 3, 3),

('MATERIAL', 'Glossário - Expressões idiomáticas em Friends', 'Lista de expressões usadas na série com tradução e exemplos.',
    '/arquivos/materiais/glossario_friends.pdf', 2, 1),

('MATERIAL', 'Guia de pronúncia - Imagine', 'Transcrição fonética de trechos da música.',
    '/arquivos/materiais/guia_pronuncia_imagine.pdf', 3, 3);

-- =========================================================
-- Conclusões de atividade: alunos marcando atividades como concluídas
-- id_atividade deve ser um conteudo_pdf do tipo ATIVIDADE (ids 1, 2 e 3)
-- =========================================================
INSERT INTO conclusao_atividade (id_aluno, id_atividade) VALUES
(4, 1),  -- Larissa concluiu a atividade de Friends
(4, 2),  -- Larissa concluiu a atividade de Forrest Gump
(5, 1),  -- João Paulo concluiu a atividade de Friends
(6, 3);  -- João Vitor concluiu a atividade de Imagine

-- =========================================================
-- Consulta de exemplo: percentual de progresso por aluno
-- (atividades concluídas / total de atividades disponíveis)
-- =========================================================
-- SELECT
--     u.nome,
--     COUNT(c.conclusao_id) AS atividades_concluidas,
--     (SELECT COUNT(*) FROM conteudo_pdf WHERE tipo = 'ATIVIDADE') AS total_atividades,
--     ROUND(
--         COUNT(c.conclusao_id)::NUMERIC
--         / (SELECT COUNT(*) FROM conteudo_pdf WHERE tipo = 'ATIVIDADE') * 100, 1
--     ) AS percentual_progresso
-- FROM usuario u
-- LEFT JOIN conclusao_atividade c ON c.id_aluno = u.user_id
-- WHERE u.perfil = 'ALUNO'
-- GROUP BY u.user_id, u.nome
-- ORDER BY u.nome;