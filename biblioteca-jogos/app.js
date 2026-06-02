const express = require('express');
const bodyParser = require('body-parser');
const jogosRoutes = require('./routes/jogos');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use('/', jogosRoutes);

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});