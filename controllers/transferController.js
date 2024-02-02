const transferService = require('../services/transferService');
const accountModel = require('../models/accountModel');
const commons = require('../common/common');

const handleTransfer = async (req, res) => {
    const userTo = commons.removeInvalidChar(req.body.userTo);
    const amount = commons.removeInvalidChar(req.body.amount);
    console.log(req.cookies.jwt);
    const userJwt = commons.removeInvalidChar(req.cookies.jwt);
    // get user from JWT token
    const userFrom = await commons.isAuthenticated(req, res, null);

    console.log(userTo, amount, userFrom);

    try {
        const result = await accountModel.transferFunds(userFrom, userTo, amount);
        if (result) {
            res.status(200).send(result);
        } else {
            res.status(404).send({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Erro inesperado' + error });
    }
};

module.exports = { 
    handleTransfer 
};
