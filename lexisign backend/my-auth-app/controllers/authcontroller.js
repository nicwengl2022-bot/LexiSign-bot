const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { users } = require("../data/users");
const { JWT_SECRET } = require("../config");

exports.signup = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  if (users.find(u => u.username === username))
    return res.status(409).json({ message: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = {
    id: users.length + 1,
    username,
    passwordHash,
    role: "user",
    createdAt: new Date(),
    lastLogin: null,
    twoFA: false,
    locked: false
  };

  users.push(newUser);

  res.status(201).json({ message: "User created", user: { username, role: "user" } });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  if (user.locked)
    return res.status(423).json({ message: "Account locked" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  user.lastLogin = new Date();

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
};
