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
    origin: ['*', 'http://localhost:8081', 'http://localhost:8080', 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://127.0.0.1:8080', 'http://127.0.0.1:8081', "https://ecommerce-cf-worker.bb.workers.dev"],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
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
      "/api/user/login",     // Added correct login endpoint
      "/api/auth/register",
      "/api/user/register",  // Added user register endpoint
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
  // Use the API_GATEWAY_URL from environment or fallback to the correct port (3010)
  // Based on prometheus.yml, the API gateway is on port 3010, not 3000
  const apiGatewayUrl = c.env.API_GATEWAY_URL || "http://localhost:3010";
  const url = new URL(c.req.url);
  const targetUrl = apiGatewayUrl + url.pathname + url.search;
  
  // Add special logging for login requests
  const isLoginRequest = url.pathname === "/api/user/login";
  
  try {
    // Add better debugging
    console.log(`Proxying ${c.req.method} request to: ${targetUrl}`);
    
    if (isLoginRequest) {
      console.log("LOGIN REQUEST: Processing login attempt");
      // Log request headers for debugging (except Authorization which might contain sensitive data)
      const headers = {};
      for (const [key, value] of c.req.headers.entries()) {
        if (key.toLowerCase() !== 'authorization') {
          headers[key] = value;
        } else {
          headers[key] = '[REDACTED]';
        }
      }
      console.log("Login request headers:", JSON.stringify(headers));
    }

    // Create a new request with the original request details
    const request = new Request(targetUrl, {
      method: c.req.method,
      headers: c.req.headers,
      body: ["GET", "HEAD"].includes(c.req.method)
        ? undefined
        : await c.req.arrayBuffer(),
      redirect: "follow",
    });

    // Forward the request to the API gateway with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(request, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (isLoginRequest) {
        console.log(`LOGIN RESPONSE: Status ${response.status}`);
      }
      
      // Create a new response with the original response details
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (isLoginRequest) {
        console.error(`LOGIN ERROR: ${fetchError.message}`);
      }
      if (fetchError.name === 'AbortError') {
        console.error(`Request to ${targetUrl} timed out after 30 seconds`);
        return c.json({ error: "Gateway Timeout", message: "API request timed out" }, 504);
      }
      throw fetchError;
    }
  } catch (error) {
    console.error(`Error proxying to API gateway (${targetUrl}):`, error);
    return c.json({ 
      error: "Internal Server Error", 
      message: "Failed to connect to API gateway",
      details: error.message 
    }, 500);
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
