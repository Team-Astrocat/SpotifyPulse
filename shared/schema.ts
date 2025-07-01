import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  spotifyId: text("spotify_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: integer("expires_at").notNull(),
  profileImage: text("profile_image"),
  country: text("country"),
  product: text("product"), // free, premium
});

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  spotifyId: text("spotify_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  trackCount: integer("track_count").default(0),
  isPublic: boolean("is_public").default(false),
  collaborative: boolean("collaborative").default(false),
});

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  spotifyId: text("spotify_id").notNull().unique(),
  name: text("name").notNull(),
  artists: jsonb("artists").notNull(), // array of artist objects
  album: jsonb("album").notNull(), // album object with name, image, etc
  duration: integer("duration_ms").notNull(),
  previewUrl: text("preview_url"),
  popularity: integer("popularity"),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  theme: text("theme").default("red-black"),
  customColors: jsonb("custom_colors"),
  volume: integer("volume").default(50),
  repeatMode: text("repeat_mode").default("off"), // off, track, context
  shuffleEnabled: boolean("shuffle_enabled").default(false),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
});

export const insertTrackSchema = createInsertSchema(tracks).omit({
  id: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Track = typeof tracks.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
