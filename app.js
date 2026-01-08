const express = require("express");
const dotenv = require("dotenv");
const db = require("./db");

dotenv.config();

const app = express();
app.use(express.json());

// Test database connection
app.get("/test-db", (req, res) => {
  db.query("SELECT 1", (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "MySQL connected successfully!" });
  });
});

app.get("/", (req, res) => {
  res.send("Express + MySQL running 🚀");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
