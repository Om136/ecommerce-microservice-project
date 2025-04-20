import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { jwtAuth } from "./middleware/jwt-auth";
import {
  productListCache,
  productDetailCache,
  staticAssetCache,
  categoryCache,
} from "./middleware/cache-strategies";

// Initialize Hono app
const app = new Hono();

// Global security headers
app.use(
  "*",
  secureHeaders({
    strictTransportSecurity: "31536000; includeSubDomains; preload",
    xContentTypeOptions: "nosniff",
    xFrameOptions: "DENY",
    xXssProtection: "1; mode=block",
    referrerPolicy: "strict-origin-when-cross-origin",
  })
);

// CORS middleware
app.use(
  "*",
  cors({
    origin: ["http://localhost:8080", "https://yourdomain.com"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
    credentials: true,
  })
);

// Rate limiting middleware
const rateLimit = async (c, next) => {
  const ip = c.req.header("CF-Connecting-IP") || "unknown";
  const key = `ratelimit:${ip}`;

  // Simple rate limiting implementation
  // In production, use Cloudflare's KV or Durable Objects
  const requestCount = c.env.CACHE ? (await c.env.CACHE.get(key)) || 0 : 0;

  if (requestCount > 100) {
    // 100 requests per minute
    return c.json({ error: "Too many requests" }, 429);
  }

  if (c.env.CACHE) {
    await c.env.CACHE.put(key, String(Number(requestCount) + 1), {
      expirationTtl: 60,
    });
  }

  await next();
};

app.use("*", rateLimit);

// Apply JWT authentication with excluded paths
app.use(
  "*",
  jwtAuth({
    excludePaths: [
      "/api/auth/login",
      "/api/auth/register",
      "/api/products", // Allow public product browsing
      "/static/", // Public static assets
    ],
  })
);

// Apply specific caching strategies to different routes
app.get("/api/products", productListCache);
app.get("/api/products/:id", productDetailCache);
app.get("/api/categories*", categoryCache);
app.get("/static/*", staticAssetCache);

// Analytics middleware
const logAnalytics = async (c, next) => {
  const startTime = Date.now();

  // Get client information
  const userAgent = c.req.header("User-Agent") || "unknown";
  const ip = c.req.header("CF-Connecting-IP") || "unknown";
  const country = c.req.header("CF-IPCountry") || "unknown";

  // Process the request
  await next();

  // Calculate request duration
  const duration = Date.now() - startTime;

  // Log analytics data
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      path: new URL(c.req.url).pathname,
      method: c.req.method,
      status: c.res.status,
      duration,
      userAgent,
      ip,
      country,
    })
  );
};

app.use("*", logAnalytics);

// Proxy all requests to the API gateway
app.all("*", async (c) => {
  const apiGatewayUrl = c.env.API_GATEWAY_URL || "http://localhost:3000";
  const url = new URL(c.req.url);
  const targetUrl = apiGatewayUrl + url.pathname + url.search;

  try {
    // Create a new request with the original request details
    const request = new Request(targetUrl, {
      method: c.req.method,
      headers: c.req.headers,
      body: ["GET", "HEAD"].includes(c.req.method)
        ? undefined
        : await c.req.arrayBuffer(),
      redirect: "follow",
    });

    // Forward the request to the API gateway
    const response = await fetch(request);

    // Create a new response with the original response details
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

    return newResponse;
  } catch (error) {
    console.error("Error proxying to API gateway:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// Handle 404 errors
app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

// Error handling
app.onError((err, c) => {
  console.error("Application error:", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
