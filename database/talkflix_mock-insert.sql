INSERT INTO usuario (nome, login, senha, perfil, ativo) VALUES
('Fábio Fernandes da Rocha Vicente', 'fabio.professor', 'senha123', 'ADMIN', TRUE),
('Maria Luiza Parischi Fogaça',      'maria.monitor',   'senha123', 'MONITOR', TRUE),
('Lucas Vieira Pagnan',              'lucas.monitor',   'senha123', 'MONITOR', TRUE),
('Larissa Cortez',                   'larissa.aluna',   'senha123', 'ALUNO', TRUE),
('João Paulo Barros',                'joaopaulo.aluno', 'senha123', 'ALUNO', TRUE),
('João Vitor Gales',                 'joaovitor.aluno', 'senha123', 'ALUNO', TRUE);


INSERT INTO interessados (email, nome, matricula) VALUES
('ana.visitante@gmail.com', 'Ana Souza', NULL),
('pedro.aluno@alunos.utfpr.edu.br', 'Pedro Lima', '2650011'),
('contato.externo@hotmail.com', 'Carla Mendes', NULL);


INSERT INTO referencia_audiovisual
    (titulo, tipo, ano, trecho, autor_artista, temporada, episodio, plataforma_fonte, link_fonte, descricao, id_monitor)
VALUES
('Friends', 'SERIE', 1994, 'Cena do café Central Perk, min. 5:00-8:30', 'David Crane e Marta Kauffman', 1, 1,
    'HBO Max', 'https://www.hbomax.com/friends', 'Diálogo introdutório entre os personagens, vocabulário do cotidiano.', 2),

('Forrest Gump', 'FILME', 1994, 'Cena do banco de praça, min. 0:00-4:00', 'Robert Zemeckis', NULL, NULL,
    'Netflix', 'https://www.netflix.com/title/forrestgump', 'Narração em primeira pessoa, bom para prática de passado simples.', 2),

('Imagine', 'MUSICA', 1971, 'Primeira estrofe e refrão', 'John Lennon', NULL, NULL,
    'Spotify', 'https://open.spotify.com/track/imagine', 'Vocabulário simples, ideal para iniciantes.', 3);


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


INSERT INTO conclusao_atividade (id_aluno, id_atividade) VALUES
(4, 1),  -- Larissa concluiu a atividade de Friends
(4, 2),  -- Larissa concluiu a atividade de Forrest Gump
(5, 1),  -- João Paulo concluiu a atividade de Friends
(6, 3);  -- João Vitor concluiu a atividade de Imagine
