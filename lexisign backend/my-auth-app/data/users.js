module.exports = {
  users: [
    // Example admin user
    {
      id: 1,
      username: "admin",
      passwordHash: "",
      role: "admin",
      createdAt: new Date(),
      lastLogin: null,
      twoFA: false,
      locked: false
    }
  ]
};
