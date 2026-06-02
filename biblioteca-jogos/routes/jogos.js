const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/jogos', (req, res) => {
    const sql = `
        SELECT 
            j.id_jogo,
            j.titulo,
            j.ano_lancamento,
            j.classificacao_indicativa,
            g.nome_genero,
            d.nome_desenvolvedora,
            GROUP_CONCAT(DISTINCT p.nome_plataforma SEPARATOR ', ') AS plataformas,
            AVG(a.nota) AS media_avaliacao
        FROM jogo j
        INNER JOIN genero g ON j.id_genero = g.id_genero
        INNER JOIN desenvolvedora d ON j.id_desenvolvedora = d.id_desenvolvedora
        LEFT JOIN jogo_plataforma jp ON j.id_jogo = jp.id_jogo
        LEFT JOIN plataforma p ON jp.id_plataforma = p.id_plataforma
        LEFT JOIN avaliacao a ON j.id_jogo = a.id_jogo
        GROUP BY 
            j.id_jogo,
            j.titulo,
            j.ano_lancamento,
            j.classificacao_indicativa,
            g.nome_genero,
            d.nome_desenvolvedora
        ORDER BY j.id_jogo DESC
    `;

    db.query(sql, (erro, jogos) => {
        if (erro) {
            console.log(erro);
            return res.send('Erro ao listar jogos.');
        }

        res.render('jogos', { jogos });
    });
});

router.get('/jogos/novo', (req, res) => {
    res.render('novo-jogo');
});

router.post('/jogos/novo', (req, res) => {
    const {
        titulo,
        ano_lancamento,
        classificacao_indicativa,
        nome_genero,
        nome_desenvolvedora,
        nome_plataforma
    } = req.body;

    db.query(
        'INSERT IGNORE INTO genero (nome_genero) VALUES (?)',
        [nome_genero],
        (erroGeneroInsert) => {
            if (erroGeneroInsert) {
                console.log(erroGeneroInsert);
                return res.send('Erro ao cadastrar gênero.');
            }

            db.query(
                'SELECT id_genero FROM genero WHERE nome_genero = ?',
                [nome_genero],
                (erroGenero, genero) => {
                    if (erroGenero || genero.length === 0) {
                        console.log(erroGenero);
                        return res.send('Erro ao buscar gênero.');
                    }

                    db.query(
                        'INSERT INTO desenvolvedora (nome_desenvolvedora, pais) VALUES (?, ?)',
                        [nome_desenvolvedora, 'Nao informado'],
                        (erroDev, dev) => {
                            if (erroDev) {
                                console.log(erroDev);
                                return res.send('Erro ao cadastrar empresa.');
                            }

                            db.query(
                                'INSERT IGNORE INTO plataforma (nome_plataforma) VALUES (?)',
                                [nome_plataforma],
                                (erroPlatInsert) => {
                                    if (erroPlatInsert) {
                                        console.log(erroPlatInsert);
                                        return res.send('Erro ao cadastrar plataforma.');
                                    }

                                    db.query(
                                        'SELECT id_plataforma FROM plataforma WHERE nome_plataforma = ?',
                                        [nome_plataforma],
                                        (erroPlat, plataforma) => {
                                            if (erroPlat || plataforma.length === 0) {
                                                console.log(erroPlat);
                                                return res.send('Erro ao buscar plataforma.');
                                            }

                                            const sqlJogo = `
                                                INSERT INTO jogo
                                                (
                                                    titulo,
                                                    ano_lancamento,
                                                    classificacao_indicativa,
                                                    id_genero,
                                                    id_desenvolvedora
                                                )
                                                VALUES (?, ?, ?, ?, ?)
                                            `;

                                            db.query(
                                                sqlJogo,
                                                [
                                                    titulo,
                                                    ano_lancamento,
                                                    classificacao_indicativa,
                                                    genero[0].id_genero,
                                                    dev.insertId
                                                ],
                                                (erroJogo, jogo) => {
                                                    if (erroJogo) {
                                                        console.log(erroJogo);
                                                        return res.send('Erro ao cadastrar jogo.');
                                                    }

                                                    db.query(
                                                        'INSERT INTO jogo_plataforma (id_jogo, id_plataforma) VALUES (?, ?)',
                                                        [jogo.insertId, plataforma[0].id_plataforma],
                                                        (erroJP) => {
                                                            if (erroJP) {
                                                                console.log(erroJP);
                                                                return res.send('Erro ao vincular plataforma ao jogo.');
                                                            }

                                                            res.redirect('/');
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

router.get('/jogos/editar/:id', (req, res) => {
    const id = req.params.id;

    const sql = `
        SELECT 
            j.*,
            g.nome_genero,
            d.nome_desenvolvedora,
            p.nome_plataforma
        FROM jogo j
        INNER JOIN genero g ON j.id_genero = g.id_genero
        INNER JOIN desenvolvedora d ON j.id_desenvolvedora = d.id_desenvolvedora
        LEFT JOIN jogo_plataforma jp ON j.id_jogo = jp.id_jogo
        LEFT JOIN plataforma p ON jp.id_plataforma = p.id_plataforma
        WHERE j.id_jogo = ?
        LIMIT 1
    `;

    db.query(sql, [id], (erro, resultado) => {
        if (erro || resultado.length === 0) {
            console.log(erro);
            return res.send('Erro ao buscar jogo.');
        }

        res.render('editar-jogo', { jogo: resultado[0] });
    });
});

router.post('/jogos/editar/:id', (req, res) => {
    const id = req.params.id;

    const {
        titulo,
        ano_lancamento,
        classificacao_indicativa,
        nome_genero,
        nome_desenvolvedora,
        nome_plataforma
    } = req.body;

    db.query(
        'INSERT IGNORE INTO genero (nome_genero) VALUES (?)',
        [nome_genero],
        (erroGeneroInsert) => {
            if (erroGeneroInsert) {
                console.log(erroGeneroInsert);
                return res.send('Erro ao cadastrar gênero.');
            }

            db.query(
                'SELECT id_genero FROM genero WHERE nome_genero = ?',
                [nome_genero],
                (erroGenero, genero) => {
                    if (erroGenero || genero.length === 0) {
                        console.log(erroGenero);
                        return res.send('Erro ao buscar gênero.');
                    }

                    db.query(
                        'INSERT IGNORE INTO plataforma (nome_plataforma) VALUES (?)',
                        [nome_plataforma],
                        (erroPlatInsert) => {
                            if (erroPlatInsert) {
                                console.log(erroPlatInsert);
                                return res.send('Erro ao cadastrar plataforma.');
                            }

                            db.query(
                                'SELECT id_plataforma FROM plataforma WHERE nome_plataforma = ?',
                                [nome_plataforma],
                                (erroPlat, plataforma) => {
                                    if (erroPlat || plataforma.length === 0) {
                                        console.log(erroPlat);
                                        return res.send('Erro ao buscar plataforma.');
                                    }

                                    db.query(
                                        'SELECT id_desenvolvedora FROM jogo WHERE id_jogo = ?',
                                        [id],
                                        (erroBusca, jogoAtual) => {
                                            if (erroBusca || jogoAtual.length === 0) {
                                                console.log(erroBusca);
                                                return res.send('Erro ao buscar jogo.');
                                            }

                                            db.query(
                                                'UPDATE desenvolvedora SET nome_desenvolvedora = ? WHERE id_desenvolvedora = ?',
                                                [nome_desenvolvedora, jogoAtual[0].id_desenvolvedora],
                                                (erroDev) => {
                                                    if (erroDev) {
                                                        console.log(erroDev);
                                                        return res.send('Erro ao editar empresa.');
                                                    }

                                                    const sqlJogo = `
                                                        UPDATE jogo
                                                        SET titulo = ?, ano_lancamento = ?, classificacao_indicativa = ?, id_genero = ?
                                                        WHERE id_jogo = ?
                                                    `;

                                                    db.query(
                                                        sqlJogo,
                                                        [
                                                            titulo,
                                                            ano_lancamento,
                                                            classificacao_indicativa,
                                                            genero[0].id_genero,
                                                            id
                                                        ],
                                                        (erroJogo) => {
                                                            if (erroJogo) {
                                                                console.log(erroJogo);
                                                                return res.send('Erro ao editar jogo.');
                                                            }

                                                            db.query(
                                                                'DELETE FROM jogo_plataforma WHERE id_jogo = ?',
                                                                [id],
                                                                (erroDel) => {
                                                                    if (erroDel) {
                                                                        console.log(erroDel);
                                                                        return res.send('Erro ao atualizar plataforma.');
                                                                    }

                                                                    db.query(
                                                                        'INSERT INTO jogo_plataforma (id_jogo, id_plataforma) VALUES (?, ?)',
                                                                        [id, plataforma[0].id_plataforma],
                                                                        (erroJP) => {
                                                                            if (erroJP) {
                                                                                console.log(erroJP);
                                                                                return res.send('Erro ao salvar plataforma.');
                                                                            }

                                                                            res.redirect('/');
                                                                        }
                                                                    );
                                                                }
                                                            );
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

router.get('/jogos/avaliar/:id', (req, res) => {
    const id = req.params.id;

    db.query(
        'SELECT * FROM jogo WHERE id_jogo = ?',
        [id],
        (erro, resultado) => {
            if (erro || resultado.length === 0) {
                console.log(erro);
                return res.send('Jogo não encontrado.');
            }

            res.render('avaliar-jogo', { jogo: resultado[0] });
        }
    );
});

router.post('/jogos/avaliar/:id', (req, res) => {
    const id_jogo = req.params.id;

    const {
        nome_usuario,
        nota,
        comentario
    } = req.body;

    const emailAutomatico =
        nome_usuario.toLowerCase().replace(/\s+/g, '') +
        Date.now() +
        '@avaliacao.com';

    db.query(
        'INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)',
        [nome_usuario, emailAutomatico, '123'],
        (erroUsuario, usuarioResultado) => {
            if (erroUsuario) {
                console.log(erroUsuario);
                return res.send('Erro ao cadastrar usuário.');
            }

            db.query(
                `
                INSERT INTO avaliacao
                (
                    nota,
                    comentario,
                    data_avaliacao,
                    id_usuario,
                    id_jogo
                )
                VALUES (?, ?, CURDATE(), ?, ?)
                `,
                [
                    nota,
                    comentario,
                    usuarioResultado.insertId,
                    id_jogo
                ],
                (erroAvaliacao) => {
                    if (erroAvaliacao) {
                        console.log(erroAvaliacao);
                        return res.send('Erro ao cadastrar avaliação.');
                    }

                    res.redirect('/');
                }
            );
        }
    );
});

router.get('/jogos/excluir/:id', (req, res) => {
    const id = req.params.id;

    db.query(
        'DELETE FROM jogo_plataforma WHERE id_jogo = ?',
        [id],
        (erroJP) => {
            if (erroJP) {
                console.log(erroJP);
                return res.send('Erro ao excluir plataformas.');
            }

            db.query(
                'DELETE FROM avaliacao WHERE id_jogo = ?',
                [id],
                (erroAvaliacao) => {
                    if (erroAvaliacao) {
                        console.log(erroAvaliacao);
                        return res.send('Erro ao excluir avaliações.');
                    }

                    db.query(
                        'DELETE FROM jogo WHERE id_jogo = ?',
                        [id],
                        (erroJogo) => {
                            if (erroJogo) {
                                console.log(erroJogo);
                                return res.send('Erro ao excluir jogo.');
                            }

                            res.redirect('/');
                        }
                    );
                }
            );
        }
    );
});

router.get('/relatorio', (req, res) => {
    const sql = `
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
        INNER JOIN genero g ON j.id_genero = g.id_genero
        INNER JOIN desenvolvedora d ON j.id_desenvolvedora = d.id_desenvolvedora
        LEFT JOIN avaliacao a ON j.id_jogo = a.id_jogo
        GROUP BY 
            j.id_jogo,
            j.titulo,
            g.nome_genero,
            d.nome_desenvolvedora
        ORDER BY j.titulo
    `;

    db.query(sql, (erro, jogos) => {
        if (erro) {
            console.log(erro);
            return res.send('Erro ao carregar relatório.');
        }

        res.render('relatorio', { jogos });
    });
});

router.get('/avaliacoes', (req, res) => {
    const sql = `
        SELECT 
            a.id_avaliacao,
            u.nome AS usuario,
            j.titulo AS jogo,
            a.nota,
            a.comentario,
            a.data_avaliacao
        FROM avaliacao a
        INNER JOIN usuario u ON a.id_usuario = u.id_usuario
        INNER JOIN jogo j ON a.id_jogo = j.id_jogo
        ORDER BY a.id_avaliacao DESC
    `;

    db.query(sql, (erro, avaliacoes) => {
        if (erro) {
            console.log(erro);
            return res.send('Erro ao listar avaliações.');
        }

        res.render('avaliacoes', { avaliacoes });
    });
});

module.exports = router;