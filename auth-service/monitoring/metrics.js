const client = require("prom-client");

// Create a Registry to register metrics
const register = new client.Registry();

// Create metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

// Add CPU and memory usage metrics
const cpuUsageGauge = new client.Gauge({
  name: "process_cpu_usage",
  help: "Process CPU usage percentage",
});

const memoryUsageGauge = new client.Gauge({
  name: "process_memory_usage_bytes",
  help: "Process memory usage in bytes",
  labelNames: ["type"],
});

// Register metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(cpuUsageGauge);
register.registerMetric(memoryUsageGauge);

// Update CPU and memory metrics every 5 seconds
let lastCpuUsage = process.cpuUsage();
let lastHrTime = process.hrtime();

setInterval(() => {
  // Update CPU metrics
  const currentCpuUsage = process.cpuUsage();
  const currentHrTime = process.hrtime();
  
  const elapsedUser = currentCpuUsage.user - lastCpuUsage.user;
  const elapsedSystem = currentCpuUsage.system - lastCpuUsage.system;
  
  const elapsedTimeInMs = 
    (currentHrTime[0] - lastHrTime[0]) * 1000 +
    (currentHrTime[1] - lastHrTime[1]) / 1000000;
  
  const cpuPercent = ((elapsedUser + elapsedSystem) / 1000) / elapsedTimeInMs * 100;
  
  cpuUsageGauge.set(cpuPercent);
  
  lastCpuUsage = currentCpuUsage;
  lastHrTime = currentHrTime;
  
  // Update memory metrics
  const memoryData = process.memoryUsage();
  memoryUsageGauge.labels('rss').set(memoryData.rss);
  memoryUsageGauge.labels('heapTotal').set(memoryData.heapTotal);
  memoryUsageGauge.labels('heapUsed').set(memoryData.heapUsed);
  memoryUsageGauge.labels('external').set(memoryData.external);
}, 5000);

module.exports = {
  register,
  httpRequestDurationMicroseconds,
  httpRequestsTotal,
  cpuUsageGauge,
  memoryUsageGauge
};
