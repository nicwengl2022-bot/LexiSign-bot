const express = require("express");
const authRoutes = require("./authRoutes");
const authenticateToken = authRoutes.authenticateToken;
const users = authRoutes._users;

const router = express.Router();

// Protected Admin Route (example)
router.get("/dashboard", authenticateToken, (req, res) => {
  res.json({ 
    message: "Admin dashboard",
    user: req.user.username
  });
});

// Admin-protected debug endpoint. Requires ADMIN_DEBUG_TOKEN env var.
function requireAdminToken(req, res, next) {
  const adminToken = process.env.ADMIN_DEBUG_TOKEN;
  if (!adminToken) return res.status(403).json({ message: "Admin debug not enabled" });

  // Accept either Bearer token or x-admin-token header
  const authHeader = req.headers['authorization'];
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.slice(7).trim();
  if (!token && req.headers['x-admin-token']) token = req.headers['x-admin-token'];

  if (!token || token !== adminToken) return res.status(401).json({ message: "Unauthorized" });
  next();
}

// Return only non-sensitive user fields for admin debugging
router.get('/debug/user/:username', requireAdminToken, (req, res) => {
  const username = req.params.username;
  const user = users[username];
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ username, hasSession: !!user.jti, lastCheck: user.lastCheck || null });
});

module.exports = router;
