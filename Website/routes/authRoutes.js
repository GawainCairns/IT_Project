const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Page routes for auth forms
router.get("/login", authController.showLogin);
router.get("/register", authController.showRegister);

// API endpoints for auth processing
router.post("/login", authController.login);
router.post("/register", authController.register);

module.exports = router;
