import { users, playlists, tracks, userSettings, type User, type InsertUser, type Playlist, type InsertPlaylist, type Track, type InsertTrack, type UserSettings, type InsertUserSettings } from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserBySpotifyId(spotifyId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Playlist management
  getUserPlaylists(userId: number): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: number, updates: Partial<Playlist>): Promise<Playlist | undefined>;
  
  // Track management
  getTrack(spotifyId: string): Promise<Track | undefined>;
  createTrack(track: InsertTrack): Promise<Track>;
  
  // User settings
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private playlists: Map<number, Playlist> = new Map();
  private tracks: Map<string, Track> = new Map();
  private userSettings: Map<number, UserSettings> = new Map();
  private currentUserId = 1;
  private currentPlaylistId = 1;
  private currentTrackId = 1;
  private currentSettingsId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserBySpotifyId(spotifyId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.spotifyId === spotifyId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserPlaylists(userId: number): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(playlist => playlist.userId === userId);
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const playlist: Playlist = {
      ...insertPlaylist,
      id: this.currentPlaylistId++,
    };
    this.playlists.set(playlist.id, playlist);
    return playlist;
  }

  async updatePlaylist(id: number, updates: Partial<Playlist>): Promise<Playlist | undefined> {
    const playlist = this.playlists.get(id);
    if (!playlist) return undefined;
    
    const updatedPlaylist = { ...playlist, ...updates };
    this.playlists.set(id, updatedPlaylist);
    return updatedPlaylist;
  }

  async getTrack(spotifyId: string): Promise<Track | undefined> {
    return this.tracks.get(spotifyId);
  }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const track: Track = {
      ...insertTrack,
      id: this.currentTrackId++,
    };
    this.tracks.set(track.spotifyId, track);
    return track;
  }

  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values()).find(settings => settings.userId === userId);
  }

  async updateUserSettings(userId: number, updates: Partial<UserSettings>): Promise<UserSettings> {
    let settings = await this.getUserSettings(userId);
    
    if (!settings) {
      settings = {
        id: this.currentSettingsId++,
        userId,
        theme: "red-black",
        customColors: null,
        volume: 50,
        repeatMode: "off",
        shuffleEnabled: false,
      };
      this.userSettings.set(settings.id, settings);
    }
    
    const updatedSettings = { ...settings, ...updates };
    this.userSettings.set(settings.id, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
