import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SpotifyWebPlaybackSDK } from "@/lib/spotify";
import { useState, useEffect } from "react";

export function useSpotify() {
  const queryClient = useQueryClient();
  const [player, setPlayer] = useState<SpotifyWebPlaybackSDK | null>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user/me'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/auth/logout'),
    onSuccess: () => {
      queryClient.clear();
      if (player) {
        player.disconnect();
        setPlayer(null);
      }
      window.location.href = '/login';
    },
  });

  useEffect(() => {
    if (user && !player) {
      // Initialize Spotify Web Playback SDK
      const initializePlayer = async () => {
        try {
          const spotifyPlayer = new SpotifyWebPlaybackSDK(user.accessToken);
          await spotifyPlayer.initialize();
          setPlayer(spotifyPlayer);
        } catch (error) {
          console.error('Failed to initialize Spotify player:', error);
        }
      };

      initializePlayer();
    }

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [user, player]);

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading,
    login,
    logout,
    player,
    isLoggedIn: !!user,
  };
}

export function useSpotifyPlayer() {
  const { player } = useSpotify();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!player) return;

    const handleStateChange = (event: CustomEvent) => {
      const state = event.detail;
      setIsPlaying(!state.paused);
      setCurrentTrack(state.track_window.current_track);
      setPosition(state.position);
      setDuration(state.duration);
    };

    window.addEventListener('spotify-player-state-changed', handleStateChange as EventListener);

    return () => {
      window.removeEventListener('spotify-player-state-changed', handleStateChange as EventListener);
    };
  }, [player]);

  const play = async (uris?: string[], contextUri?: string) => {
    if (!player) throw new Error('Player not initialized');
    await player.play(uris, contextUri);
  };

  const pause = async () => {
    if (!player) throw new Error('Player not initialized');
    await player.pause();
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  };

  const nextTrack = async () => {
    if (!player) throw new Error('Player not initialized');
    await player.nextTrack();
  };

  const previousTrack = async () => {
    if (!player) throw new Error('Player not initialized');
    await player.previousTrack();
  };

  const setVolume = async (volume: number) => {
    if (!player) throw new Error('Player not initialized');
    await player.setVolume(volume);
  };

  return {
    player,
    isPlaying,
    currentTrack,
    position,
    duration,
    play,
    pause,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
  };
}
