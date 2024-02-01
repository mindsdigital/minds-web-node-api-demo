const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/users/:username", (req, res) => {
    console.log(req.params);
    userController.handleGetUser(req, res);
});

module.exports = router;
