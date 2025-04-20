const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const metrics = require("./monitoring/metrics");

const app = express();

// Improved CORS configuration
app.use(cors({
  origin: ['/*', 'http://localhost:8081/*', 'http://localhost:8080/*', 'http://localhost:5500/*', 'http://127.0.0.1:5500/*', 'http://127.0.0.1:8080/*', 'http://127.0.0.1:8081/*', "https://ecommerce-cf-worker.bb.workers.dev/*"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

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
  const metric = await metrics.register.metrics();
  res.send(metric);
});

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://auth-service:3001/api/auth",
    changeOrigin: true,
  })
);

app.use(
  "/api/user",
  createProxyMiddleware({
    target: "http://user-service:3002/api/user",
    changeOrigin: true,
  })
);

app.use(
  "/api/product",
  createProxyMiddleware({
    target: "http://product-service:3003/api/product",
    changeOrigin: true,
  })
);

app.use(
  "/api/category",
  createProxyMiddleware({
    target: "http://product-service:3003/api/category",
    changeOrigin: true,
  })
);

app.use(
  "/uploads",
  createProxyMiddleware({
    target: "http://product-service:3003/uploads",
    changeOrigin: true,
  })
);

app.use(
  "/api/cart",
  createProxyMiddleware({
    target: "http://cart-service:3004/api/cart",
    changeOrigin: true,
  })
);

app.use(
  "/api/order",
  createProxyMiddleware({
    target: "http://order-service:3005/api/order",
    changeOrigin: true,
  })
);

app.use(
  "/api/statistical",
  createProxyMiddleware({
    target: "http://order-service:3005/api/statistical",
    changeOrigin: true,
  })
);

app.listen(3010, () => {
  console.log("API Gateway running on http://localhost:3010");
});
