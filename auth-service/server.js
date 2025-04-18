const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const metrics = require('../monitoring/metrics');
const app = express();
require("dotenv").config();

app.use(express.json());

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.httpRequestDurationMicroseconds
      .labels(req.method, req.path, res.statusCode)
      .observe(duration / 1000);
    metrics.httpRequestsTotal
      .labels(req.method, req.path, res.statusCode)
      .inc();
  });
  next();
});

// Expose metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', metrics.register.contentType);
  const metrics = await metrics.register.metrics();
  res.send(metrics);
});

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
