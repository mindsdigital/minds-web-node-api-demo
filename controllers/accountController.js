const accountService = require('../services/accountService');
const accountModel = require('../models/accountModel');

const account = async (req, res) => {
    console.log('Account controller: '+ req.params);
    try {
        const transactions = await accountService.getTransactions(req.params.username);
        if (transactions) {
            console.log('Transactions: '+ transactions);
            res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
            res.render('account', { transactions });
        } else {
            res.status(404).send({ message: 'Transações não encontradas' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Erro inesperado' + error });
    }
};

module.exports = { 
    account 
};
