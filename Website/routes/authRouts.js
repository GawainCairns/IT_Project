const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/login", authController.showLogin);
router.get("/register", authController.showRegister);
router.post("/login", authController.login);
router.post("/register", authController.register);

module.exports = router;