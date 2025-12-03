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

// Password validation according to policy
function validatePassword(password) {
  if (typeof password !== 'string') return { valid: false, message: 'Password must be a string' };
  const len = password.length;
  if (len < 8 || len > 15) return { valid: false, message: 'Password must be 8-15 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must include at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must include at least one lowercase letter' };
  if (!/[!@#$%^&*]/.test(password)) return { valid: false, message: 'Password must include at least one special character (!@#$%^&*)' };
  return { valid: true };
}

// Track failed login attempts by IP for throttling
const FAILED_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_FAILED = 5;
const failedAttemptsByIP = {}; // { ip: { count, firstAttempt } }

// Remove expired entries periodically (simple cleanup)
setInterval(() => {
  const now = Date.now();
  for (const ip of Object.keys(failedAttemptsByIP)) {
    if (now - failedAttemptsByIP[ip].firstAttempt > FAILED_WINDOW_MS) {
      delete failedAttemptsByIP[ip];
    }
  }
}, 10 * 60 * 1000);

// ---------------- Signup ----------------
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (users[username]) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const pwCheck = validatePassword(password);
  if (!pwCheck.valid) {
    return res.status(400).json({ message: pwCheck.message });
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
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  // Check IP block/attempts
  const entry = failedAttemptsByIP[ip];
  const now = Date.now();
  if (entry && entry.count >= MAX_FAILED) {
    if (now - entry.firstAttempt <= FAILED_WINDOW_MS) {
      const retryAfter = Math.ceil((FAILED_WINDOW_MS - (now - entry.firstAttempt)) / 1000);
      return res.status(429).json({ message: `Too many failed attempts from this IP. Try again in ${retryAfter} seconds` });
    } else {
      // window expired
      delete failedAttemptsByIP[ip];
    }
  }

  const user = users[username];
  if (!user) {
    // increment failed count for IP
    if (!failedAttemptsByIP[ip]) failedAttemptsByIP[ip] = { count: 1, firstAttempt: now };
    else failedAttemptsByIP[ip].count++;
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    if (!failedAttemptsByIP[ip]) failedAttemptsByIP[ip] = { count: 1, firstAttempt: now };
    else failedAttemptsByIP[ip].count++;
    const attemptsLeft = Math.max(0, MAX_FAILED - failedAttemptsByIP[ip].count);
    return res.status(401).json({ message: "Invalid username or password", attemptsLeft });
  }

  // Successful login -> reset failed attempts for IP
  delete failedAttemptsByIP[ip];

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

// Expose seedAdmin for runtime admin seeding and export internals
async function seedAdmin(username, password) {
  if (!username || !password) throw new Error('username and password required');
  const pwCheck = validatePassword(password);
  if (!pwCheck.valid) throw new Error(`Password policy violation: ${pwCheck.message}`);
  const passwordHash = await bcrypt.hash(password, 10);
  users[username] = users[username] || {};
  users[username].passwordHash = passwordHash;
  users[username].isAdmin = true;
  // Don't set jti here; admin will log in to receive token
  console.log(`Admin user ${username} seeded (in-memory)`);
}

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.JWT_SECRET = JWT_SECRET;
module.exports._users = users; // exported for diagnostics/tests
module.exports.seedAdmin = seedAdmin;

// Dev-only debug endpoint. Keep disabled unless explicitly enabled via ENABLE_DEBUG
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
