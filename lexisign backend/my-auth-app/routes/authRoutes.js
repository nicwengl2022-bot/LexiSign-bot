const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Replace this with your Render environment variable
const JWT_SECRET = process.env.JWT_SECRET || "yourStrongSecret";

// Use in-memory "database" for demo purposes
const users = {}; // { username: { passwordHash } }

// ---------------- Signup ----------------
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (users[username]) {
    return res.status(409).json({ message: "Username already exists" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    users[username] = { passwordHash };
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ---------------- Login ----------------
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users[username];
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Export authenticateToken middleware for use in other routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.JWT_SECRET = JWT_SECRET;
