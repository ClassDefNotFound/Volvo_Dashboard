import "dotenv/config";

const {
  // API Configs
  VCC_API_KEY,
  ACCESS_TOKEN,
  CLIENT_ID,
  CLIENT_SECRET,
  // App configs
  BASE_URL,
  PORT,
  NODE_ENV,
  REDIS_URL,
} = process.env;

// Local mode: static ACCESS_TOKEN is provided without OAuth credentials.
// Intended for personal/local use where full OAuth flow is not needed.
const isLocalMode = !!ACCESS_TOKEN && !CLIENT_ID && !CLIENT_SECRET;

if (!VCC_API_KEY) {
  throw new Error("VCC_API_KEY is required");
}

if (isLocalMode && !ACCESS_TOKEN) {
  throw new Error("Local mode requires: VCC_API_KEY, ACCESS_TOKEN");
}

if (!isLocalMode && (!CLIENT_ID || !CLIENT_SECRET || !ACCESS_TOKEN)) {
  throw new Error(
    "OAuth mode requires: VCC_API_KEY, ACCESS_TOKEN, CLIENT_ID, CLIENT_SECRET",
  );
}

export const config = {
  // Server
  port: PORT || 3000,
  nodeEnv: NODE_ENV || "development",
  isLocalMode,
  // URLs
  homeUrl: `${BASE_URL}`,
  volvoRedirectUrl: "https://volvoid.eu.volvocars.com/as/authorization.oauth2",
  volvoTokenUrl: "https://volvoid.eu.volvocars.com/as/token.oauth2",
  volvoApiUrl: "https://api.volvocars.com/connected-vehicle/v2",
  // Volvo credentials
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  vccApiKey: VCC_API_KEY,
  accessToken: ACCESS_TOKEN,
  // Redis
  redisUrl: REDIS_URL || "redis://localhost:6379",
} as const;
