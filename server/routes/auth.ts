import { Router } from "express";
import crypto from "crypto";
import axios from "axios";
import { config } from "config.js";
import type { Token } from "../../shared/types/api.js";

const router = Router();

// Extend session type to include our custom properties
// SessionData by default only has `cookie` property
declare module "express-session" {
  interface SessionData {
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: number;
    oauthState?: string;
    volvoUserId?: string;
    codeVerifier?: string;
  }
}

router.get("/login", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  req.session.oauthState = state;
  req.session.codeVerifier = codeVerifier;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: `${config.clientId}`,
    redirect_uri: config.homeUrl,
    scope: [
      "openid",
      "conve:vehicle_relation",
      "conve:brake_status",
      "conve:fuel_status",
      "conve:doors_status",
      "conve:engine_status",
      "conve:diagnostics_workshop",
      "conve:diagnostics_engine_status",
      "conve:windows_status",
      "conve:tyres_status",
      "conve:odometer_status",
      "conve:warnings",
      "conve:trip_statistics",
      "conve:environment",
      "conve:lock_status",
      "conve:connectivity_status",
    ].join(" "),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  res.redirect(`${config.volvoRedirectUrl}?${params.toString()}`);
});

router.get("/callback", async (req, res) => {
  const { code, state } = req.query;
  const { oauthState, codeVerifier } = req.session;

  if (state !== oauthState) {
    return res.status(400).json({ error: "Invalid state parameter" });
  }

  if (!code) {
    return res.status(400).json({ error: "Authorization code not found" });
  }

  if (!codeVerifier) {
    return res.status(400).json({ error: "Code verifier not found" });
  }

  try {
    console.log("Exchanging auth code for tokens");

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code: code as string,
      redirect_uri: `${config.homeUrl}/auth/callback`,
      code_verifier: codeVerifier,
    });

    const tokenResponse = await axios.post<Token>(
      config.volvoTokenUrl,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
        },
      },
    );

    req.session.accessToken = tokenResponse.data.access_token;
    req.session.refreshToken = tokenResponse.data.refresh_token;
    req.session.tokenExpiry = Date.now() + tokenResponse.data.expires_in * 1000;
    delete req.session.codeVerifier;

    console.log("Authentication successful, session:", req.sessionID);
    res.redirect(config.homeUrl);
  } catch (err) {
    console.error("OAuth callback error", err);
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.get("/status", (req, res) => {
  if (config.isLocalMode) {
    return res.json({ authenticated: true, mode: "local" });
  }

  if (req.session.accessToken) {
    res.json({ authenticated: true, expiresAt: req.session.tokenExpiry });
  } else {
    res.json({ authenticated: false });
  }
});

router.post("/logout", (req, res) => {
  const sessionId = req.sessionID;
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session", err);
      return res.status(500).json({ error: "Logout failed" });
    }
    console.log("Session destroyed:", sessionId);
    res.clearCookie("volvo.sid");
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
