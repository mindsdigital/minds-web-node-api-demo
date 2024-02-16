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
app.use(express.json());
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

app.get('/newAccount', accountRoute);

app.post('/newAccount', accountRoute);

app.post('/transferFunds', transferRoute);

app.get('/authenticated', common.isAuthenticated, (req, res) => {
    res.render('authenticated');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
