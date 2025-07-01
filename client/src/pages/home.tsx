import { useSpotify } from "@/hooks/use-spotify";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import AudioPlayer from "@/components/audio-player";
import SearchBar from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const { user, logout } = useSpotify();
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: recentlyPlayed } = useQuery({
    queryKey: ['/api/spotify/me/player/recently-played'],
    enabled: !!user,
  });

  const { data: playlists } = useQuery({
    queryKey: ['/api/spotify/me/playlists'],
    enabled: !!user,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['/api/spotify/recommendations'],
    enabled: !!user,
  });

  const playTrack = (track: any) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex h-screen bg-black-primary text-white">
      <Sidebar 
        user={user} 
        playlists={playlists?.items || []} 
        onLogout={logout}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-black-secondary border-b border-gray-primary p-4">
          <div className="flex items-center justify-between">
            {/* Navigation Arrows */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 bg-gray-primary rounded-full hover:bg-gray-secondary"
              >
                <i className="fas fa-chevron-left text-white text-sm"></i>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 bg-gray-primary rounded-full hover:bg-gray-secondary"
              >
                <i className="fas fa-chevron-right text-white text-sm"></i>
              </Button>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <SearchBar onTrackSelect={playTrack} />
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-tertiary hover:text-white">
                <i className="fas fa-bell"></i>
              </Button>
              <div className="w-8 h-8 rounded-full overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-red-primary flex items-center justify-center">
                    <i className="fas fa-user text-white text-sm"></i>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
              </h1>
              <select className="bg-black-tertiary text-white px-3 py-1 rounded border border-gray-primary focus:border-red-primary focus:outline-none">
                <option>Recently played</option>
                <option>Alphabetical</option>
                <option>Date added</option>
              </select>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {playlists?.items?.slice(0, 6).map((playlist: any) => (
                <div 
                  key={playlist.id}
                  className="bg-black-secondary hover:bg-black-tertiary p-4 rounded-lg cursor-pointer transition-colors group"
                  onClick={() => playTrack(playlist)}
                >
                  <div className="flex items-center space-x-4">
                    <img 
                      src={playlist.images?.[0]?.url || '/placeholder-album.png'} 
                      alt={playlist.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{playlist.name}</h3>
                      <p className="text-sm text-gray-tertiary">{playlist.tracks.total} songs</p>
                    </div>
                    <Button
                      size="icon"
                      className="w-12 h-12 bg-red-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="fas fa-play text-white"></i>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Played */}
          {recentlyPlayed?.items && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recently played</h2>
                <Button variant="ghost" className="text-gray-tertiary hover:text-white text-sm font-medium">
                  Show all
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {recentlyPlayed.items.slice(0, 10).map((item: any, index: number) => (
                  <div 
                    key={`${item.track.id}-${index}`}
                    className="bg-black-secondary hover:bg-black-tertiary p-4 rounded-lg cursor-pointer transition-colors group"
                    onClick={() => playTrack(item.track)}
                  >
                    <img 
                      src={item.track.album.images?.[0]?.url || '/placeholder-album.png'} 
                      alt={item.track.name}
                      className="w-full aspect-square rounded-lg mb-4 object-cover"
                    />
                    <h3 className="font-semibold text-white truncate mb-2">{item.track.name}</h3>
                    <p className="text-sm text-gray-tertiary truncate">
                      {item.track.artists.map((artist: any) => artist.name).join(', ')}
                    </p>
                    <Button
                      size="icon"
                      className="w-12 h-12 bg-red-primary rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="fas fa-play text-white"></i>
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recommendations */}
          {recommendations?.tracks && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recommended for you</h2>
                <Button variant="ghost" className="text-gray-tertiary hover:text-white text-sm font-medium">
                  Show all
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {recommendations.tracks.slice(0, 10).map((track: any) => (
                  <div 
                    key={track.id}
                    className="bg-black-secondary hover:bg-black-tertiary p-4 rounded-lg cursor-pointer transition-colors group"
                    onClick={() => playTrack(track)}
                  >
                    <img 
                      src={track.album.images?.[0]?.url || '/placeholder-album.png'} 
                      alt={track.name}
                      className="w-full aspect-square rounded-lg mb-4 object-cover"
                    />
                    <h3 className="font-semibold text-white truncate mb-2">{track.name}</h3>
                    <p className="text-sm text-gray-tertiary truncate">
                      {track.artists.map((artist: any) => artist.name).join(', ')}
                    </p>
                    <Button
                      size="icon"
                      className="w-12 h-12 bg-red-primary rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="fas fa-play text-white"></i>
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Audio Player */}
        <AudioPlayer 
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onNext={() => {/* TODO: Implement next track */}}
          onPrevious={() => {/* TODO: Implement previous track */}}
        />
      </div>
    </div>
  );
}
