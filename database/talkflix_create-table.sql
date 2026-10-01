-- tipos enumerados para os campos de domínio fechado
-- é case-sensitive

CREATE TYPE perfil_usuario AS ENUM ('ADMIN', 'MONITOR', 'ALUNO');
CREATE TYPE tipo_referencia AS ENUM ('SERIE', 'FILME', 'MUSICA', 'OUTRO');
CREATE TYPE tipo_conteudo AS ENUM ('ATIVIDADE', 'MATERIAL');

-- =========================================================
CREATE TABLE usuario (
    user_id        SERIAL PRIMARY KEY,
    nome           VARCHAR(150) NOT NULL,
    login          VARCHAR(100) NOT NULL UNIQUE,
    senha          VARCHAR(255) NOT NULL,
    perfil         perfil_usuario NOT NULL,
    ativo          BOOLEAN NOT NULL DEFAULT TRUE,
    data_cadastro  TIMESTAMP NOT NULL DEFAULT NOW()
);
-- =========================================================
CREATE TABLE interessados (
    interessado_id  SERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    nome            VARCHAR(150),
    matricula       VARCHAR(50),
    data_cadastro   TIMESTAMP NOT NULL DEFAULT NOW()
);
-- =========================================================
CREATE TABLE referencia_audiovisual (
    ref_id            SERIAL PRIMARY KEY,
    titulo            VARCHAR(200) NOT NULL,
    tipo              tipo_referencia NOT NULL,
    ano               INTEGER,
    trecho            VARCHAR(255),
    autor_artista     VARCHAR(150),
    temporada         INTEGER,      
    episodio          INTEGER,    
    plataforma_fonte  VARCHAR(200),
    link_fonte        VARCHAR(500),
    descricao         TEXT,
    id_monitor        INTEGER REFERENCES usuario(user_id),
    data_cadastro     TIMESTAMP NOT NULL DEFAULT NOW()
);
-- =========================================================
CREATE TABLE conteudo_pdf (
    conteudo_id         SERIAL PRIMARY KEY,
	tipo				tipo_conteudo NOT NULL,
    titulo              VARCHAR(200) NOT NULL,
    descricao           TEXT,
    arquivo_url         VARCHAR(500) NOT NULL,
    id_monitor_criador  INTEGER REFERENCES usuario(user_id),
    id_ref_audio        INTEGER NOT NULL REFERENCES referencia_audiovisual(ref_id),
    data_cadastro       TIMESTAMP NOT NULL DEFAULT NOW()
);
-- =========================================================
CREATE TABLE conclusao_atividade (
    conclusao_id    SERIAL PRIMARY KEY,
    id_aluno        INTEGER NOT NULL REFERENCES usuario(user_id),
    id_atividade    INTEGER NOT NULL REFERENCES conteudo_pdf(conteudo_id),
    data_conclusao  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (id_aluno, id_atividade) 
	-- impede que o mesmo aluno registre a atividade mais de uma vez
);

-- =========================================================
-- Índices de apoio à busca e filtragem 
-- permite que o banco pule direto pros registros que interessam, sem  precisar varrer tudo

CREATE INDEX idx_referencia_tipo ON referencia_audiovisual(tipo);
CREATE INDEX idx_referencia_ano ON referencia_audiovisual(ano);
CREATE INDEX idx_conteudo_ref ON conteudo_pdf(id_ref_audio);
CREATE INDEX idx_conclusao_aluno ON conclusao_atividade(id_aluno);