const express = require("express");
const authRoutes = require("./authRoutes");
const authenticateToken = authRoutes.authenticateToken;

const router = express.Router();

// Protected Profile Route
router.get("/profile", authenticateToken, (req, res) => {
  // In a real app, fetch user data from a database
  res.json({ 
    username: req.user.username, 
    message: "Welcome to your profile!" 
  });
});

module.exports = router;
