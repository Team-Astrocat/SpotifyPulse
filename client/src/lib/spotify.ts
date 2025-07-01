export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string; height: number; width: number }>;
  tracks: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string; height: number; width: number }>;
  country: string;
  product: string;
}

export class SpotifyWebPlaybackSDK {
  private player: any = null;
  private deviceId: string = '';
  private accessToken: string = '';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Spotify) {
        this.setupPlayer();
        resolve();
      } else {
        window.onSpotifyWebPlaybackSDKReady = () => {
          this.setupPlayer();
          resolve();
        };

        if (!document.querySelector('script[src*="spotify-player"]')) {
          const script = document.createElement('script');
          script.src = 'https://sdk.scdn.co/spotify-player.js';
          script.async = true;
          document.head.appendChild(script);
        }
      }
    });
  }

  private setupPlayer(): void {
    this.player = new window.Spotify.Player({
      name: 'RedTunes Player',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(this.accessToken);
      },
      volume: 0.5
    });

    this.player.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('Ready with Device ID', device_id);
      this.deviceId = device_id;
    });

    this.player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Device ID has gone offline', device_id);
    });

    this.player.addListener('player_state_changed', (state: any) => {
      if (!state) return;
      
      console.log('Player state changed', state);
      // Emit custom events for state changes
      window.dispatchEvent(new CustomEvent('spotify-player-state-changed', { detail: state }));
    });

    this.player.connect();
  }

  async play(uris?: string[], contextUri?: string): Promise<void> {
    if (!this.deviceId) {
      throw new Error('Player not ready');
    }

    const body: any = {
      device_id: this.deviceId
    };

    if (uris) {
      body.uris = uris;
    } else if (contextUri) {
      body.context_uri = contextUri;
    }

    const response = await fetch('/api/spotify/me/player/play', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Failed to play track');
    }
  }

  async pause(): Promise<void> {
    const response = await fetch('/api/spotify/me/player/pause', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to pause track');
    }
  }

  async nextTrack(): Promise<void> {
    const response = await fetch('/api/spotify/me/player/next', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to skip to next track');
    }
  }

  async previousTrack(): Promise<void> {
    const response = await fetch('/api/spotify/me/player/previous', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to skip to previous track');
    }
  }

  async setVolume(volume: number): Promise<void> {
    const response = await fetch(`/api/spotify/me/player/volume?volume_percent=${volume}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to set volume');
    }
  }

  async getCurrentState(): Promise<any> {
    return this.player?.getCurrentState();
  }

  disconnect(): void {
    if (this.player) {
      this.player.disconnect();
    }
  }
}

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}
