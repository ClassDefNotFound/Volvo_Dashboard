import express from "express";
import cors from "cors";
import session from "express-session";
import axios from "axios";
import { redisClient, redisStore, connectRedis } from "./redis-store.js";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";
import { config } from "config.js";
import type {
  Request,
  Response,
  NextFunction,
} from "express-serve-static-core";
import type { TokenResponse } from "@shared/types/api.js";

const app = express();

// CORS configuration - allow credentials
app.use(
  cors({
    origin: config.isLocalMode ? `${config.homeUrl}:5173` : config.homeUrl,
    credentials: true,
  }),
);

// Parse JSON bodies
app.use(express.json());

// Session middleware (Redis store) - must be registered before routes
app.use(
  session({
    store: redisStore,
    secret: config.clientSecret ?? config.accessToken!,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      secure: config.nodeEnv === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
    name: "volvo.sid",
  }),
);

async function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Local mode: static token in config, no session required
  if (config.isLocalMode) {
    return next();
  }

  if (!req.session.accessToken) {
    return res.redirect("/auth/login");
  }

  // Refresh token if expiring within 1 hour
  const oneHour = 60 * 60 * 1000;
  if (
    req.session.tokenExpiry &&
    req.session.tokenExpiry < Date.now() + oneHour
  ) {
    try {
      const refreshResponse = await axios.post<TokenResponse>(
        config.volvoTokenUrl,
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: req.session.refreshToken!,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
          },
        },
      );

      req.session.accessToken = refreshResponse.data.access_token;
      req.session.refreshToken = refreshResponse.data.refresh_token;
      req.session.tokenExpiry =
        Date.now() + refreshResponse.data.expires_in * 1000;

      console.log("Token refreshed for session:", req.sessionID);
    } catch (err) {
      console.error("Token refresh failed, re-authenticating", err);
      const sessionId = req.sessionID;
      req.session.destroy((destroyError) => {
        if (destroyError) {
          console.error(
            "Error destroying session after refresh failure",
            destroyError,
          );
        }
        console.log("Session destroyed:", sessionId);
      });
      return res.redirect("/auth/login");
    }
  }

  next();
}

// Health check - no auth required
app.get("/health", async (_req, res) => {
  try {
    await redisClient.ping();
    res.json({
      status: "healthy",
      redis: "connected",
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      redis: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Auth routes are public (login/callback initiate the OAuth flow)
app.use("/auth", authRoutes);

// API routes require authentication
app.use("/api", ensureAuthenticated, apiRoutes);

connectRedis().then(() => {
  app.listen(config.port, () => {
    console.log(
      `Server listening on port ${config.port} (${config.isLocalMode ? "local mode" : "OAuth mode"})`,
    );
  });
});
