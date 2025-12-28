const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
app.use(express.json());
app.use(express.static("../public"));

/* Register */
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;
    const hashed = bcrypt.hashSync(password, 10);

    db.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
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

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, result) => {
            if (result.length === 0) return res.status(401).send("Invalid");

            const valid = bcrypt.compareSync(password, result[0].password);
            if (!valid) return res.status(401).send("Invalid");

            res.send({ message: "Login success", userId: result[0].id });
        }
    );
});

/* Get Users */


app.listen(3000, () => console.log("Server running on port 3000"));
