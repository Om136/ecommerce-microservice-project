const express = require("express");
const cors = require("cors");
const metrics = require("../monitoring/metrics");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const path = require("path");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// Configure image uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);

app.listen(3003, () => {
  console.log("Product Service running on http://localhost:3003");
});
