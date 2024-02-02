const accountService = require('../services/accountService');
const userService = require('../services/userService');
const accountModel = require('../models/accountModel');

const account = async (req, res) => {
    
    const listOfUsers = await userService.getAllUsers();

    try {
        const transactions = await accountService.getTransactions(req.params.username);
        if (transactions) {
            incomingTotal = 0;
            outgoingTotal = 0;
            transactions.forEach(row => {
                if (row.transaction_direction == "incoming") {
                    incomingTotal += row.amount;
                  }
                  if (row.transaction_direction == "outgoing") {
                    outgoingTotal += row.amount;
                  }
            });
            res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
            res.render('account', { data: { transactions, incomingTotal, outgoingTotal, listOfUsers }});
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
