const express = require("express");
const dotenv = require("dotenv");
const db = require("./db");

dotenv.config();

const app = express();
app.use(express.json());

// Test database connection
app.get("/test-db", async (req, res) => {
  try {
    await db.connect();
    await db.query("SELECT 1");
    res.json({ message: "MySQL connected successfully!" });
  } catch (err) {
    res.status(500).json({ error: err && err.message ? err.message : String(err) });
  }
});

app.get("/", (req, res) => {
  res.send("Express + MySQL running 🚀");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});