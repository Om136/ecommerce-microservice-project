// Configuration file for API endpoints
const config = {
  // For development with the local API gateway
  localApiUrl: "http://127.0.0.1:8787",

  // For production using Cloudflare Worker
  cloudflareWorkerUrl: "https://ecommerce-cf-worker.itsmeshubbb.workers.dev",

  // Set this to true to use the Cloudflare Worker, false to use local API
  useCloudflareWorker: false,
};

// Define API_URL based on configuration
const API_URL = config.useCloudflareWorker
  ? config.cloudflareWorkerUrl
  : config.localApiUrl;

// Make compatible with both CommonJS and browser
try {
  // For CommonJS environments
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_URL, config };
  }
} catch (e) {
  // Ignore errors, browser environment doesn't support module.exports
}

// For browser environments - make variables global
if (typeof window !== 'undefined') {
  window.API_URL = API_URL;
  window.config = config;
}