const db = require("../config/db");

// Get all surveys for a user
exports.getSurveysByUser = async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const [surveys] = await db.promisePool.query(
      "SELECT * FROM surveys WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.json(surveys);
  } catch (err) {
    console.error("Error fetching surveys:", err);
    res.status(500).json({ message: err.message || "Failed to fetch surveys" });
  }
};

// Create a new survey
exports.createSurvey = async (req, res) => {
  try {
    const { userId, title, description, questions } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ message: "userId and title are required" });
    }

    const [result] = await db.promisePool.query(
      "INSERT INTO surveys (user_id, title, description, questions) VALUES (?, ?, ?, ?)",
      [userId, title, description || null, JSON.stringify(questions || [])]
    );

    res.status(201).json({ 
      message: "Survey created", 
      surveyId: result.insertId 
    });
  } catch (err) {
    console.error("Error creating survey:", err);
    res.status(500).json({ message: err.message || "Failed to create survey" });
  }
};

// Update a survey
exports.updateSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, questions } = req.body;

    const [result] = await db.promisePool.query(
      "UPDATE surveys SET title = ?, description = ?, questions = ? WHERE id = ?",
      [title, description || null, JSON.stringify(questions || []), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Survey not found" });
    }

    res.json({ message: "Survey updated" });
  } catch (err) {
    console.error("Error updating survey:", err);
    res.status(500).json({ message: err.message || "Failed to update survey" });
  }
};

// Delete a survey
exports.deleteSurvey = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.promisePool.query(
      "DELETE FROM surveys WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Survey not found" });
    }

    res.json({ message: "Survey deleted" });
  } catch (err) {
    console.error("Error deleting survey:", err);
    res.status(500).json({ message: err.message || "Failed to delete survey" });
  }
};
