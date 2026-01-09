const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const db = require("./config/db");

dotenv.config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Test database connection
app.get("/test-db", async (req, res) => {
  try {
    const [result] = await db.promisePool.query("SELECT 1");
    res.json({ message: "MySQL connected successfully!" });
  } catch (err) {
    res.status(500).json({ error: err && err.message ? err.message : String(err) });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

// Page Routes
app.use("/", require("./routes/pageRoutes"));

// Auth Routes
app.use("/auth", require("./routes/authRoutes"));

// Survey API Routes
app.use("/api", require("./routes/surveyRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Initialize database and start server
const PORT = process.env.PORT || 3000;

db.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log("Database connected successfully");
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message || err);
    process.exit(1);
  });