const accountService = require('../services/accountService');
const userService = require('../services/userService');
const accountModel = require('../models/accountModel');
const commons = require('../common/common');
const { HttpStatusCode } = require('axios');

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
            res.render('account', { data: { transactions, incomingTotal, outgoingTotal, listOfUsers } });
        } else {
            res.status(404).send({ message: 'Transações não encontradas' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Erro inesperado' + error });
    }
};

const openNewAccount = async (req, res) => {
    const username = commons.removeInvalidChar(req.body.username);
    const documentId = commons.removeInvalidChar(req.body.documentId);
    const phoneNumber = commons.removeInvalidChar(req.body.phoneNumber);
    const email = req.body.email;
    const fullName = req.body.fullName;
    const active = true;
    const brand = "Vox Bank";
    const profile = "";

    try {
        const result = await userService.addUser(username, documentId, phoneNumber, active, email, brand, profile, fullName);
        if (result) {
            res.sendStatus(HttpStatusCode.Created);
        } else {
            res.status(HttpStatusCode.NotAcceptable).send({ message: 'Not Acceptable' });
        }
    }
    catch (error) {
        res.status(HttpStatusCode.InternalServerError).send({ message: 'Erro inesperado' + error });
    }
}

module.exports = {
    account,
    openNewAccount
};
