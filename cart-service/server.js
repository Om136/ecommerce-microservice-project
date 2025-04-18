const express = require("express");
const cors = require("cors");
const metrics = require("../monitoring/metrics");
const cartRoutes = require("./routes/cartRoutes");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
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

// Expose metrics endpoint
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", metrics.register.contentType);
  const metrics = await metrics.register.metrics();
  res.send(metrics);
});

app.use("/api/cart", cartRoutes);

app.listen(3004, () => {
  console.log("Cart Service running on http://localhost:3004");
});
