const accountModel = require('../models/accountModel');

const transferFunds = async (userFrom, userTo, amount) => {
    const userFromAccount = await accountModel.getAccount(userFrom);
    const userToAccount = await accountModel.getAccount(userTo);
    const amountToTransfer = amount;

    

}