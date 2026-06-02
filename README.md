Codigo MySQL WorkBench

DROP DATABASE IF EXISTS biblioteca_jogos;

CREATE DATABASE biblioteca_jogos
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE biblioteca_jogos;

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL
);

CREATE TABLE genero (
    id_genero INT AUTO_INCREMENT PRIMARY KEY,
    nome_genero VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE desenvolvedora (
    id_desenvolvedora INT AUTO_INCREMENT PRIMARY KEY,
    nome_desenvolvedora VARCHAR(100) NOT NULL,
    pais VARCHAR(50) NOT NULL
);

CREATE TABLE plataforma (
    id_plataforma INT AUTO_INCREMENT PRIMARY KEY,
    nome_plataforma VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE jogo (
    id_jogo INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    ano_lancamento INT NOT NULL,
    classificacao_indicativa VARCHAR(10) NOT NULL,
    id_genero INT NOT NULL,
    id_desenvolvedora INT NOT NULL,

 CONSTRAINT fk_jogo_genero
        FOREIGN KEY (id_genero)
        REFERENCES genero(id_genero)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

CONSTRAINT fk_jogo_desenvolvedora
        FOREIGN KEY (id_desenvolvedora)
        REFERENCES desenvolvedora(id_desenvolvedora)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

CONSTRAINT chk_ano
        CHECK (ano_lancamento >= 1970)
);

CREATE TABLE avaliacao (
    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    nota DECIMAL(3,1) NOT NULL,
    comentario TEXT,
    data_avaliacao DATE NOT NULL,
    id_usuario INT NOT NULL,
    id_jogo INT NOT NULL,

 CONSTRAINT fk_avaliacao_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

 CONSTRAINT fk_avaliacao_jogo
        FOREIGN KEY (id_jogo)
        REFERENCES jogo(id_jogo)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

CONSTRAINT chk_nota
        CHECK (nota >= 0 AND nota <= 10)
);

CREATE TABLE jogo_plataforma (
    id_jogo INT NOT NULL,
    id_plataforma INT NOT NULL,

   PRIMARY KEY (id_jogo, id_plataforma),

CONSTRAINT fk_jp_jogo
        FOREIGN KEY (id_jogo)
        REFERENCES jogo(id_jogo)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

CONSTRAINT fk_jp_plataforma
        FOREIGN KEY (id_plataforma)
        REFERENCES plataforma(id_plataforma)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

INSERT INTO usuario (nome, email, senha) VALUES
('Carlos Silva', 'carlos@email.com', '123456'),
('Mariana Souza', 'mariana@email.com', 'abc123'),
('Joao Pereira', 'joao@email.com', 'senha789');

INSERT INTO genero (nome_genero) VALUES
('Acao'),
('RPG'),
('Esporte');

INSERT INTO desenvolvedora (nome_desenvolvedora, pais) VALUES
('Rockstar Games', 'Estados Unidos'),
('CD Projekt Red', 'Polonia'),
('EA Sports', 'Estados Unidos');

INSERT INTO plataforma (nome_plataforma) VALUES
('PC'),
('PlayStation 5'),
('Xbox Series X');

INSERT INTO jogo (
    titulo,
    ano_lancamento,
    classificacao_indicativa,
    id_genero,
    id_desenvolvedora
) VALUES
('Grand Theft Auto V', 2013, '18', 1, 1),
('The Witcher 3', 2015, '16', 2, 2),
('EA Sports FC 24', 2023, 'Livre', 3, 3);

INSERT INTO jogo_plataforma (id_jogo, id_plataforma) VALUES
(1,1),
(1,2),
(1,3),
(2,1),
(2,2),
(3,2),
(3,3);

INSERT INTO avaliacao (
    nota,
    comentario,
    data_avaliacao,
    id_usuario,
    id_jogo
) VALUES
(9.5, 'Jogo muito divertido.', '2026-05-10', 1, 1),
(10.0, 'Historia excelente.', '2026-05-11', 2, 2),
(8.0, 'Bom jogo de futebol.', '2026-05-12', 3, 3);

CREATE VIEW vw_relatorio_jogos AS
SELECT
    j.id_jogo,
    j.titulo,
    g.nome_genero,
    d.nome_desenvolvedora,
    COUNT(a.id_avaliacao) AS quantidade_avaliacoes,
    AVG(a.nota) AS media_avaliacao,
    MIN(a.nota) AS menor_nota,
    MAX(a.nota) AS maior_nota
FROM jogo j
INNER JOIN genero g
    ON j.id_genero = g.id_genero
INNER JOIN desenvolvedora d
    ON j.id_desenvolvedora = d.id_desenvolvedora
LEFT JOIN avaliacao a
    ON j.id_jogo = a.id_jogo
GROUP BY
    j.id_jogo,
    j.titulo,
    g.nome_genero,
    d.nome_desenvolvedora;

SELECT * FROM vw_relatorio_jogos;
