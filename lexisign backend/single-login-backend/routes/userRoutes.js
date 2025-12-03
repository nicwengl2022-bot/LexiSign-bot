const express = require("express");
const authRouter = require("./authRoutes");
const authenticateToken = authRouter.authenticateToken;
const users = authRouter._users;

const router = express.Router();

// Protected Profile Route
router.get("/profile", authenticateToken, (req, res) => {
  // In a real app, fetch user data from a database
  res.json({ 
    username: req.user.username, 
    message: "Welcome to your profile!" 
  });
});

// Return last background check for the authenticated user
router.get("/checks", authenticateToken, (req, res) => {
  const username = req.user.username;
  const user = users[username];
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ lastCheck: user.lastCheck || null });
});

module.exports = router;
