const express = require("express");
const app = express();

app.use(express.json());

// Placeholder webhook route
app.post("/webhook", (req, res) => {
  console.log("Webhook received:", req.body);
  res.status(200).send("Webhook received!");
});

// Test route
app.get("/", (req, res) => {
  res.send("LexiSign Bot backend is live!");
});

// Future UPS integration placeholder
// You can add UPS code here later, using environment variables:
// const UPS_CLIENT_SECRET = process.env.UPS_CLIENT_SECRET;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
