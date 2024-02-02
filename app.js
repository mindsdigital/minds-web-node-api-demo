const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;
//const cors = require('cors');
const helmet = require('helmet');
const { error } = require('console');
const { type } = require('os');

const common = require('./common/common');
const userRoute = require('./routes/users');
const loginRoute = require('./routes/login');
const accountRoute = require('./routes/account');
const transferRoute = require('./routes/transfer');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
//app.use(cors());
app.use(helmet.contentSecurityPolicy());

app.get('/login', loginRoute);

app.get('/minhaconta/:username', accountRoute);

app.post('/login', loginRoute);

app.get('/users/:username', userRoute);

app.get('/account/:username', accountRoute);

app.post('/transferFunds', transferRoute);

app.post('/register', async (req, res) => {
    const { username, phone_number, document_id } = req.body;

    try {
        const userData = await readCSV(username);

        res.status(400).json({ error: 'Usuário já cadastrado.' });
    } catch (error) {
        if (error.message === 'Usuário não encontrado no CSV') {
            try {
                const newData = { username, phone_number, document_id };
                await appendToCSV(newData);

                res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
            } catch (error) {
                res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
            }
        } else {
            // Handle other errors
            res.status(500).json({ error: 'Erro inesperado.' });
        }
    }
});

app.get('/authenticated', common.isAuthenticated, (req, res) => {
    // O objeto req.user agora contém os dados do usuário, se necessário
    res.render('authenticated');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
