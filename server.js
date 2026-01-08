const express = require("express");
const bcrypt = require("bcryptjs");
const path = require("path");
const db = require("./db");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "Website")));

/* Register */
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).send("Missing fields");
    const hashed = bcrypt.hashSync(password, 10);

    db.query(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        [username, email, hashed],
        (err) => {
            if (err) return res.status(500).send("Error");
            res.send("Registered");
        }
    );
});

/* Login */
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send("Missing fields");

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (err) return res.status(500).send("Error");
        if (!result || result.length === 0) return res.status(401).send("Invalid");

        const hash = result[0].password_hash || result[0].password;
        const valid = bcrypt.compareSync(password, hash);
        if (!valid) return res.status(401).send("Invalid");

        res.send({ message: "Login success", userId: result[0].id });
    });
});

/* Start server only after DB connected */
db.connect()
    .then(() => {
        const port = process.env.PORT || 3000;
        app.listen(port, () => console.log(`Server running on port ${port}`));
    })
    .catch((err) => {
        console.error("Failed to start server due to DB error:", err.message || err);
        process.exit(1);
    });