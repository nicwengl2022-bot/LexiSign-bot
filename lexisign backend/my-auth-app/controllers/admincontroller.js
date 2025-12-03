const { users } = require("../data/users");

exports.getAllUsers = (req, res) => {
  res.json(
    users.map(u => ({
      id: u.id,
      username: u.username,
      role: u.role,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      twoFA: u.twoFA,
      locked: u.locked
    }))
  );
};

exports.lockUser = (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id == id);
  
  if (!user) return res.status(404).json({ message: "User not found" });
  
  user.locked = true;
  
  res.json({ message: `User ${id} locked` });
};

exports.unlockUser = (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id == id);
  
  if (!user) return res.status(404).json({ message: "User not found" });
  
  user.locked = false;
  
  res.json({ message: `User ${id} unlocked` });
};

exports.forcePasswordReset = (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id == id);
  
  if (!user) return res.status(404).json({ message: "User not found" });
  
  user.mustResetPassword = true;
  
  res.json({ message: `Password reset forced for user ${id}` });
};
