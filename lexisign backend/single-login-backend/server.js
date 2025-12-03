const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

async function start() {
  app.use(cors());
  app.use(express.json());

  // Serve the Test folder as a static login page at /login
  app.use(
    "/login",
    express.static(path.join(__dirname, "../../../Test"), { extensions: ["html"] })
  );

  // Redirect root to the login page for convenience
  app.get("/", (req, res) => {
    res.redirect("/login/");
  });

  app.use("/auth", authRoutes);
  app.use("/user", userRoutes);
  app.use("/admin", adminRoutes);

  // Seed admin if env vars provided
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (adminUser && adminPass && authRoutes.seedAdmin) {
    try {
      await authRoutes.seedAdmin(adminUser, adminPass);
    } catch (err) {
      console.error('Failed to seed admin user:', err.message || err);
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
