require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL Database!");
});

// User Registration
app.post("/register", (req, res) => {
    const { username, password } = req.body;

    db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], 
    (err, result) => {
        if (err) return res.status(500).json({ message: "Error registering user" });
        res.json({ message: "Registration successful!" });
    });
});

// User Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = results[0];
        if (user.password !== password) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    });
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(403).json({ message: "Access denied" });

    jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
};

// Get Balance
app.get("/balance", authenticateToken, (req, res) => {
    // Log user ID for debugging purposes
    console.log("User ID:", req.user.id);

    db.query("SELECT balance FROM users WHERE id = ?", [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching balance" });

        // Check if user exists
        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return balance if user exists
        res.json({ balance: results[0].balance });
    });
});

// Deposit Money
app.post("/deposit", authenticateToken, (req, res) => {
    const { amount } = req.body;
    if (amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    db.query("UPDATE users SET balance = balance + ? WHERE id = ?", [amount, req.user.id], (err) => {
        if (err) return res.status(500).json({ message: "Error depositing money" });
        res.json({ message: "Deposit successful" });
    });
});

// Withdraw Money
app.post("/withdraw", authenticateToken, (req, res) => {
    const { amount } = req.body;
    if (amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    db.query("SELECT balance FROM users WHERE id = ?", [req.user.id], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ message: "Error fetching balance" });

        if (results[0].balance < amount) return res.status(400).json({ message: "Insufficient funds" });

        db.query("UPDATE users SET balance = balance - ? WHERE id = ?", [amount, req.user.id], (err) => {
            if (err) return res.status(500).json({ message: "Error withdrawing money" });
            res.json({ message: "Withdrawal successful" });
        });
    });
});

// Start Server
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
