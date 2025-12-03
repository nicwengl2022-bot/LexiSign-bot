const { users } = require("../data/users");

exports.getProfile = (req, res) => {
  const user = users.find(u => u.id === req.user.id);

  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    twoFA: user.twoFA,
    locked: user.locked
  });
};
