const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const router = express.Router();

// Replace this with your Render environment variable
const JWT_SECRET = process.env.JWT_SECRET || "yourStrongSecret";

// Use in-memory "database" for demo purposes
const users = {}; // { username: { passwordHash, jti, lastCheck } }

// Simple background check queue (in-memory)
function backgroundCheck(username, meta = {}) {
  // run asynchronously and do not block login response
  setTimeout(() => {
    try {
      const riskScore = Math.floor(Math.random() * 100);
      const result = {
        riskScore,
        checkedAt: new Date().toISOString(),
        meta,
      };
      if (users[username]) {
        users[username].lastCheck = result;
      }
      // For demo, log the result
      console.log(`Background check for ${username}:`, result);
    } catch (err) {
      console.error("Background check failed:", err);
    }
  }, 250);
}

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

  // Generate a JTI (JWT ID) for single-login enforcement
  const jti = (crypto.randomUUID && crypto.randomUUID()) || crypto.randomBytes(16).toString("hex");
  // store jti for the user (invalidates previous sessions)
  users[username].jti = jti;

  const token = jwt.sign({ username, jti }, JWT_SECRET, { expiresIn: "1h" });

  // Fire background checks (non-blocking)
  const meta = { ip: req.ip, ua: req.get("user-agent") };
  backgroundCheck(username, meta);

  res.json({ token });
});

// ---------------- Auth Middleware ----------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    const { username, jti } = payload || {};
    if (!username) return res.status(403).json({ message: "Invalid token payload" });

    const user = users[username];
    if (!user) return res.status(401).json({ message: "User not found" });

    // Enforce single-login: token's jti must match stored jti
    if (!user.jti || user.jti !== jti) {
      return res.status(403).json({ message: "Session invalid or expired (single-login enforced)" });
    }

    req.user = { username };
    next();
  });
}

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.JWT_SECRET = JWT_SECRET;
module.exports._users = users; // exported for diagnostics/tests

// Dev-only: return internal user state for debugging
// Note: keep this disabled or protected in production
// Dev-only debug endpoint. Enable by setting `ENABLE_DEBUG=true` in the environment.
const ENABLE_DEBUG = process.env.ENABLE_DEBUG === 'true';
router.get('/debug/user/:username', (req, res) => {
  if (!ENABLE_DEBUG) return res.status(404).json({ message: 'Not found' });
  const username = req.params.username;
  const user = users[username];
  if (!user) return res.status(404).json({ message: 'User not found' });
  // Return only non-sensitive fields for debugging
  return res.json({
    username,
    hasSession: !!user.jti,
    lastCheck: user.lastCheck || null,
  });
});
