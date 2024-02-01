const accountModel = require('../models/accountModel');

const getTransactions = (username) => {
    return accountModel.getTransactions(username);
};

module.exports = {
    getTransactions
};
