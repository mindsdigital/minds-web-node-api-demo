const userModel = require('../models/userModel');

const getUser = (username) => {
    return userModel.getUser(username);
};

module.exports = {
    getUser
};
