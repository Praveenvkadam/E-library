/**
 * eurekaClient.js
 * Registers the Node.js AiService with the Spring Eureka server.
 */

const { Eureka } = require("eureka-js-client");
const os = require("os");

// ── Resolve local machine IP ──────────────────────────────────────────────────
const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
};

const HOST_IP     = process.env.SERVICE_HOST || getLocalIp();
const PORT        = parseInt(process.env.PORT || "5001", 10);
const APP_NAME    = (process.env.SERVICE_NAME || "AI-SERVICE").toUpperCase();
const EUREKA_HOST = process.env.EUREKA_HOST || "localhost";
const EUREKA_PORT = parseInt(process.env.EUREKA_PORT || "8761", 10);

// ── Fix: eureka-js-client requires ALL logger methods to exist ────────────────
const silentLogger = {
  level:  "warn",
  debug:  () => {},
  info:   () => {},
  warn:   (msg) => console.warn("[Eureka]", msg),
  error:  (msg) => console.error("[Eureka]", msg),
};

const client = new Eureka({
  instance: {
    app: APP_NAME,
    hostName: HOST_IP,
    ipAddr: HOST_IP,
    port: {
      $: PORT,
      "@enabled": true,
    },
    vipAddress: APP_NAME,
    statusPageUrl:  `http://${HOST_IP}:${PORT}/ai/health`,
    healthCheckUrl: `http://${HOST_IP}:${PORT}/ai/health`,
    homePageUrl:    `http://${HOST_IP}:${PORT}/`,
    dataCenterInfo: {
      "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      name: "MyOwn",
    },
  },
  eureka: {
    host: EUREKA_HOST,
    port: EUREKA_PORT,
    servicePath: "/eureka/apps/",
    maxRetries: 10,
    requestRetryDelay: 2000,
  },
  logger: silentLogger,
});

/**
 * Register with Eureka — call AFTER Express server is listening.
 */
const registerWithEureka = () => {
  return new Promise((resolve, reject) => {
    client.start((error) => {
      if (error) {
        console.error("[Eureka] ❌ Registration failed:", error.message);
        reject(error);
      } else {
        console.log(`[Eureka] ✅ Registered as ${APP_NAME} @ ${HOST_IP}:${PORT}`);
        console.log(`[Eureka] 🔗 Dashboard → http://${EUREKA_HOST}:${EUREKA_PORT}`);
        resolve();
      }
    });
  });
};

/**
 * Deregister cleanly on shutdown.
 */
const deregisterFromEureka = () => {
  return new Promise((resolve) => {
    client.stop((error) => {
      if (error) console.warn("[Eureka] Deregister warning:", error.message);
      else        console.log("[Eureka] ✅ Deregistered cleanly.");
      resolve();
    });
  });
};

module.exports = { registerWithEureka, deregisterFromEureka };