const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const { upload }= require('../controllers/accountController');

router.get("/account/:username", (req, res) => {
    accountController.account(req, res);
});

router.post("/newAccount", upload.single('audio'), (req, res) => {
    accountController.openNewAccount(req, res, req.file);
});

router.get("/newAccount", (req, res) => {
    res.render('newAccount');
});

module.exports = router;
