const userService = require('../services/userService');
const userModel = require('../models/userModel');
const { HttpStatusCode } = require('axios');

const handleGetUser = async (req, res) => {
    try {
        const user = await userService.getUser(req.params.username);
        if (user) {
            res.status(200).send(user);
        } else {
            res.status(404).send({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Erro inesperado' + error });
    }
};

const addNewUser = async (req, res) => {
    try {
        const user = await userService.addUser(req.params.username);
        if (user) {
            res.status(HttpStatusCode.Created).send(user);
        } else {
            res.status(HttpStatusCode.NotAcceptable).send({ message: 'Not Acceptable' });
        }
    } catch (error) {
        res.status(HttpStatusCode.InternalServerError).send({ message: 'Erro inesperado' + error });
    }
};

module.exports = { 
    handleGetUser, 
    addNewUser 
};
