const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;
//const cors = require('cors');
const helmet = require('helmet');
const { error } = require('console');
const { type } = require('os');

const userRoute = require('./routes/users');
const loginRoute = require('./routes/login');
const accountRoute = require('./routes/account');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
//app.use(cors());
app.use(helmet.contentSecurityPolicy());

app.get('/login', (req, res) => {
    res.set("Content-Security-Policy", "default-src *; media-src 'self' http://* blob:; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
        .render('login');
});

app.get('/cadastrar', (req, res) => {
    res.set("Content-Security-Policy", "default-src *; media-src 'self' http://* blob:; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
        .render('register');
});

app.get('/register', (req, res) => {
    res.set("Content-Security-Policy", "default-src *; media-src 'self' http://* blob:; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
        .render('register');
});

app.get('/minhaconta', (req, res) => {
    res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
        .render('account');
});

app.post('/login', loginRoute);

app.get('/users/:username', userRoute);

app.get('/account/:username', accountRoute);

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

app.get('/authenticated', isAuthenticated, (req, res) => {
    // O objeto req.user agora contém os dados do usuário, se necessário
    res.render('authenticated');
});

function isAuthenticated(req, res, next) {
    const token = req.cookies && req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            res.redirect('/login?error=invalid_token');
        }
    } else {
        res.redirect('/login?error=missing_token');
    }
}



app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
