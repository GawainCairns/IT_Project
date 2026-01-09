const express = require("express");
const router = express.Router();

// Home page
router.get("/", (req, res) => {
  res.sendFile(__dirname + "/../views/index.html");
});

// Dashboard page
router.get("/dashboard", (req, res) => {
  res.sendFile(__dirname + "/../views/dashboard.html");
});

// Survey page
router.get("/survey", (req, res) => {
  res.sendFile(__dirname + "/../views/survey.html");
});

// Survey creator page
router.get("/survey-creator", (req, res) => {
  res.sendFile(__dirname + "/../views/surveycreator.html");
});

// About page
router.get("/about", (req, res) => {
  res.sendFile(__dirname + "/../views/about.html");
});

// Contact page
router.get("/contact", (req, res) => {
  res.sendFile(__dirname + "/../views/contact.html");
});

module.exports = router;
