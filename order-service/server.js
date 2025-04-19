const express = require("express");
const cors = require("cors");
const metrics = require("./monitoring/metrics");
const orderRoutes = require("./routes/orderRoutes");
const statisticalRoutes = require("./routes/statisticalRoutes");

const app = express();

// Improved CORS configuration
app.use(cors({
  origin: ['http://localhost:8081/*', 'http://localhost:8080/*', 'http://localhost:5500/*', 'http://127.0.0.1:5500/*', 'http://127.0.0.1:8080/*', 'http://127.0.0.1:8081/*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

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
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', metrics.register.contentType);
  const metric = await metrics.register.metrics();
  res.send(metric);
});

app.use("/api/order", orderRoutes);
app.use("/api/statistical", statisticalRoutes);

app.listen(3005, () => {
  console.log("Order Service running on http://localhost:3005");
});
