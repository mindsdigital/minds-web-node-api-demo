const userModel = require('../models/userModel');

const getUser = (username) => {
    return userModel.getUser(username);
};

const getAllUsers = () => {
    return userModel.getAllUsers();
};

const addUser = (username, documentId, activated, phoneNumber, email, brand, profile, fullName) => {
    return userModel.addUser(username, documentId, activated, phoneNumber, email, brand, profile, fullName);
}

module.exports = {
    getUser,
    getAllUsers,
    addUser
};
