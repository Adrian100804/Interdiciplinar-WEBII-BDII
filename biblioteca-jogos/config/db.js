const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '100804',
    database: 'biblioteca_jogos'
});

connection.connect((erro) => {
    if (erro) {
        console.log('Erro ao conectar ao MySQL:', erro);
        return;
    }

    console.log('Conectado ao MySQL!');
});

module.exports = connection;