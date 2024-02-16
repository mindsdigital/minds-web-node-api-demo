const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

router.get("/account/:username", (req, res) => {
    accountController.account(req, res);
});

router.post("/newAccount", (req, res) => {
    accountController.openNewAccount(req, res);
});

router.get("/newAccount", (req, res) => {
    res.send("New Account will be here");
});

module.exports = router;
