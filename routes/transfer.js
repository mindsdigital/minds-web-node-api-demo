const express = require("express");
const router = express.Router();
const transferController = require("../controllers/transferController");

router.post("/transferFunds", (req, res) => {
    transferController.handleTransfer(req, res);
});

module.exports = router;