// Configuration file for API endpoints
const config = {
  // For development with the local API gateway
  localApiUrl: "http://localhost:3000",

  // For production using Cloudflare Worker
  cloudflareWorkerUrl: "https://ecommerce-cf-worker.itsmeshubbb.workers.dev",

  // Set this to true to use the Cloudflare Worker, false to use local API
  useCloudflareWorker: true,
};

// Export the active API URL based on configuration
export const API_URL = config.useCloudflareWorker
  ? config.cloudflareWorkerUrl
  : config.localApiUrl;
