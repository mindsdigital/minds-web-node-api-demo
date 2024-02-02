const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");
const { upload } = require('../controllers/loginController');

router.post("/login", upload.single('audio'), (req, res) => {
    loginController.postLogin(req, res, req.file);
});

router.get("/login", (req, res) => {
    res.set("Content-Security-Policy", "default-src *; media-src 'self' http://* blob:; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
        .render('login');
});

module.exports = router;