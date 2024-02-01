const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

router.get("/account/:username", (req, res) => {
    console.log('Account Params: '+ req.params);
    accountController.account(req, res);
});

module.exports = router;
