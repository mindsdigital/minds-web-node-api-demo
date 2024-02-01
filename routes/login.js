const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");
const { upload } = require('../controllers/loginController');

router.post("/login", upload.single('audio'), (req, res) => {
    loginController.postLogin(req, res, req.file);
});

module.exports = router;