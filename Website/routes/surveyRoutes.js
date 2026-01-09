const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController");

// Get surveys for a user
router.get("/surveys", surveyController.getSurveysByUser);

// Create a new survey
router.post("/surveys", surveyController.createSurvey);

// Update a survey
router.put("/surveys/:id", surveyController.updateSurvey);

// Delete a survey
router.delete("/surveys/:id", surveyController.deleteSurvey);

module.exports = router;
