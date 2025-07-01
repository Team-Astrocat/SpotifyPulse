import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertUserSettingsSchema } from "@shared/schema";
import { z } from "zod";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || process.env.VITE_SPOTIFY_CLIENT_ID || "your_client_id";
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "your_client_secret";

// Dynamic redirect URI based on environment
function getRedirectUri(req: any): string {
  if (process.env.SPOTIFY_REDIRECT_URI) {
    return process.env.SPOTIFY_REDIRECT_URI;
  }
  
  // Auto-detect from request headers
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
  const host = req.get('host') || 'localhost:5000';
  return `${protocol}://${host}/api/auth/callback`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.get("/api/auth/login", (req, res) => {
    const scopes = [
      "user-read-private",
      "user-read-email",
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "user-read-recently-played",
      "playlist-read-private",
      "playlist-read-collaborative",
      "playlist-modify-public",
      "playlist-modify-private",
      "user-library-read",
      "user-library-modify",
      "streaming"
    ].join(" ");

    const redirectUri = getRedirectUri(req);
    const params = new URLSearchParams({
      response_type: "code",
      client_id: SPOTIFY_CLIENT_ID,
      scope: scopes,
      redirect_uri: redirectUri,
      state: Math.random().toString(36).substring(7)
    });

    res.redirect(`https://accounts.spotify.com/authorize?${params}`);
  });

  app.get("/api/auth/callback", async (req, res) => {
    const { code, error } = req.query;

    if (error) {
      return res.redirect(`/?error=${error}`);
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          redirect_uri: getRedirectUri(req)
        })
      });

      const tokens = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokens.error_description || "Failed to get access token");
      }

      // Get user profile
      const profileResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          "Authorization": `Bearer ${tokens.access_token}`
        }
      });

      const profile = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error("Failed to get user profile");
      }

      // Check if user exists, create if not
      let user = await storage.getUserBySpotifyId(profile.id);
      
      if (!user) {
        user = await storage.createUser({
          spotifyId: profile.id,
          displayName: profile.display_name || profile.id,
          email: profile.email,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: Date.now() + (tokens.expires_in * 1000),
          profileImage: profile.images?.[0]?.url,
          country: profile.country,
          product: profile.product
        });
      } else {
        // Update tokens
        user = await storage.updateUser(user.id, {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: Date.now() + (tokens.expires_in * 1000),
          profileImage: profile.images?.[0]?.url,
          country: profile.country,
          product: profile.product
        });
      }

      // Store user session
      (req.session as any).userId = user!.id;

      res.redirect("/?authenticated=true");
    } catch (error) {
      console.error("Auth callback error:", error);
      res.redirect(`/?error=${encodeURIComponent("Authentication failed")}`);
    }
  });

  // User routes
  app.get("/api/user/me", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      profileImage: user.profileImage,
      country: user.country,
      product: user.product
    });
  });

  // Spotify API proxy routes
  app.get("/api/spotify/*", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if token is expired
    if (Date.now() >= user.expiresAt) {
      try {
        // Refresh token
        const refreshResponse = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: user.refreshToken
          })
        });

        const tokens = await refreshResponse.json();
        
        if (refreshResponse.ok) {
          await storage.updateUser(user.id, {
            accessToken: tokens.access_token,
            expiresAt: Date.now() + (tokens.expires_in * 1000)
          });
          user.accessToken = tokens.access_token;
        }
      } catch (error) {
        console.error("Token refresh error:", error);
        return res.status(401).json({ error: "Token refresh failed" });
      }
    }

    try {
      const spotifyPath = req.path.replace("/api/spotify", "");
      const spotifyUrl = `https://api.spotify.com/v1${spotifyPath}${req.url.includes('?') ? '&' + req.url.split('?')[1] : ''}`;
      
      const spotifyResponse = await fetch(spotifyUrl, {
        method: req.method,
        headers: {
          "Authorization": `Bearer ${user.accessToken}`,
          "Content-Type": "application/json"
        },
        body: req.method !== "GET" ? JSON.stringify(req.body) : undefined
      });

      const data = await spotifyResponse.json();
      
      if (!spotifyResponse.ok) {
        return res.status(spotifyResponse.status).json(data);
      }

      res.json(data);
    } catch (error) {
      console.error("Spotify API error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User settings routes
  app.get("/api/settings", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const settings = await storage.getUserSettings(userId);
    res.json(settings || {
      theme: "red-black",
      customColors: null,
      volume: 50,
      repeatMode: "off",
      shuffleEnabled: false
    });
  });

  app.post("/api/settings", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const validatedSettings = insertUserSettingsSchema.omit({ userId: true }).parse(req.body);
      const settings = await storage.updateUserSettings(userId, validatedSettings);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid settings data" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
    });
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
