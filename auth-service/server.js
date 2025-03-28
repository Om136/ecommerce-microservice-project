const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const app = express();
require("dotenv").config();

app.use(express.json());

// Verify JWT and return user information (role, id)
app.post("/api/auth/verify", async (req, res) => {
  const token = req.body.token;
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err)
      return res.status(403).json({ message: "Failed to authenticate token" });

    const userId = decoded.id;

    try {
      const response = await axios.get(
        `http://localhost:3002/api/user/role/${userId}`
      );
      const userRole = response.data.role_id;

      res.json({ userId, role: userRole });
    } catch (error) {
      console.error("Error fetching role:", error.message);
      res.status(403).json({ message: "Unauthorized" });
    }
  });
});

app.listen(3001, () => {
  console.log("Authentication Service running on http://localhost:3001");
});
