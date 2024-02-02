const userModel = require('../models/userModel');

const getUser = (username) => {
    return userModel.getUser(username);
};

const getAllUsers = () => {
    return userModel.getAllUsers();
};

module.exports = {
    getUser,
    getAllUsers
};
