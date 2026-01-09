const db = require("../config/db");
const bcrypt = require("bcrypt");
const path = require("path");

exports.showLogin = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/auth/login.html"));
};

exports.showRegister = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/auth/register.html"));
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashed = bcrypt.hashSync(password, 10);

    const [result] = await db.promisePool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashed]
    );

    res.status(201).json({ message: "User registered successfully", userId: result.insertId });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: err.message || "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const [rows] = await db.promisePool.query(
      "SELECT id, username, email, password FROM users WHERE email = ?",
      [email]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const valid = bcrypt.compareSync(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ 
      message: "Login successful", 
      userId: user.id, 
      username: user.username 
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message || "Login failed" });
  }
};