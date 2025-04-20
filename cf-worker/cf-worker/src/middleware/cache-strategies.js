/**
 * Advanced caching strategies for Cloudflare Worker
 * This file contains various caching configurations for different routes
 */

// Helper function to determine if a response is cacheable
const isCacheable = (request, response) => {
  // Only cache GET requests
  if (request.method !== "GET") return false;

  // Don't cache if there's an Authorization header (user-specific data)
  if (request.headers.has("Authorization")) {
    // Exception: Public product listings can be cached even with auth
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/products")) {
      return false;
    }
  }

  // Don't cache error responses
  if (response.status !== 200) return false;

  return true;
};

// Cache middleware factory with customizable options
export const createCacheStrategy = (options = {}) => {
  const {
    cacheName = "default-cache",
    cacheControl = "max-age=3600", // 1 hour by default
    staleWhileRevalidate = 60, // 1 minute stale-while-revalidate
    bypassCache = false, // Flag to bypass cache for debugging
    varyByHeaders = [], // Headers to vary the cache by
  } = options;

  return async (c, next) => {
    // Skip caching if explicitly disabled
    if (bypassCache || c.req.header("cache-control") === "no-cache") {
      return await next();
    }

    // Create a cache key based on URL and selected headers
    let cacheKeyUrl = c.req.url;

    // Add vary headers to cache key if specified
    if (varyByHeaders.length > 0) {
      const varyParams = varyByHeaders
        .map((header) => `${header}=${c.req.header(header) || "none"}`)
        .join("&");
      cacheKeyUrl += `?${varyParams}`;
    }

    const cacheKey = new Request(cacheKeyUrl);

    // Try to get from cache
    if (c.env.CACHE) {
      try {
        const cachedResponse = await c.env.CACHE.match(cacheKey);

        if (cachedResponse) {
          // Return cached response
          return cachedResponse;
        }
      } catch (error) {
        console.error("Cache read error:", error);
      }
    }

    // If not in cache or cache error, fetch from origin
    await next();

    // After the origin fetch completes, store in cache if appropriate
    if (c.env.CACHE && isCacheable(c.req, c.res)) {
      try {
        // Clone the response before caching
        const responseToCache = new Response(c.res.body, c.res);

        // Set cache control headers
        responseToCache.headers.set("Cache-Control", cacheControl);
        responseToCache.headers.set("X-Cache", "HIT");
        responseToCache.headers.set("CF-Cache-Status", "HIT");

        if (staleWhileRevalidate) {
          responseToCache.headers.append(
            "Cache-Control",
            `stale-while-revalidate=${staleWhileRevalidate}`
          );
        }

        // Store in cache (don't await to avoid delaying response)
        c.executionCtx.waitUntil(
          c.env.CACHE.put(cacheKey, responseToCache.clone())
        );

        // Return the response with cache headers
        return responseToCache;
      } catch (error) {
        console.error("Cache write error:", error);
      }
    }

    // Return original response if caching failed or wasn't appropriate
    return c.res;
  };
};

// Predefined cache strategies for common use cases
export const productListCache = createCacheStrategy({
  cacheName: "product-list-cache",
  cacheControl: "max-age=3600", // 1 hour
  staleWhileRevalidate: 300, // 5 minutes
});

export const productDetailCache = createCacheStrategy({
  cacheName: "product-detail-cache",
  cacheControl: "max-age=7200", // 2 hours
  staleWhileRevalidate: 600, // 10 minutes
});

export const staticAssetCache = createCacheStrategy({
  cacheName: "static-asset-cache",
  cacheControl: "max-age=86400", // 24 hours
  staleWhileRevalidate: 3600, // 1 hour
});

export const categoryCache = createCacheStrategy({
  cacheName: "category-cache",
  cacheControl: "max-age=21600", // 6 hours
  staleWhileRevalidate: 1800, // 30 minutes
});
