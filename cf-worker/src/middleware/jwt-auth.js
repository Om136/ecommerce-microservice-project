/**
 * JWT validation middleware for Cloudflare Worker
 * This middleware validates JWT tokens before passing requests to the API gateway
 */

// Simple JWT validation function
// In production, you'd want to use a proper JWT library
export const validateJWT = (token, secret) => {
  try {
    // Base64Url decode the token parts
    const [header, payload, signature] = token.split(".");

    // In a real implementation, we would:
    // 1. Decode the header and payload
    // 2. Verify the signature using the secret
    // 3. Check token expiration
    // 4. Verify issuer, audience, etc.

    // For this example, we'll assume a token is valid if it has 3 parts
    return token.split(".").length === 3;
  } catch (error) {
    console.error("JWT validation error:", error);
    return false;
  }
};

// Middleware function to validate JWT tokens
export const jwtAuth = (options = {}) => {
  const { excludePaths = [] } = options;

  return async (c, next) => {
    // Check if the path is excluded from authentication
    const path = new URL(c.req.url).pathname;

    // Skip authentication for excluded paths
    for (const excludePath of excludePaths) {
      if (path.startsWith(excludePath) || path === excludePath) {
        return await next();
      }
    }

    // Get authorization header
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized - No valid token provided" }, 401);
    }

    const token = authHeader.split(" ")[1];

    // In a real implementation, get the JWT secret from environment variables
    // For now, we'll use a hardcoded secret matching your JWT_SECRET
    const isValid = validateJWT(token, "YOUR_SECRET_KEY");

    if (!isValid) {
      return c.json({ error: "Unauthorized - Invalid token" }, 401);
    }

    // Token is valid, proceed to the next middleware or handler
    await next();
  };
};
