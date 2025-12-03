function requireAdminRole(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied: Requires Admin Role" });
  }
  next();
}

module.exports = requireAdminRole;
