import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SearchBarProps {
  onTrackSelect: (track: any) => void;
}

export default function SearchBar({ onTrackSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/spotify/search', query],
    enabled: query.length > 2,
    queryFn: async () => {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&type=track,artist,album&limit=10`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
  });

  useEffect(() => {
    setIsOpen(query.length > 2 && !!searchResults);
  }, [query, searchResults]);

  const handleTrackSelect = (track: any) => {
    onTrackSelect(track);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for songs, artists, or albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-black-tertiary text-white pl-10 pr-4 py-2 rounded-full border border-gray-primary focus:border-red-primary transition-colors"
        />
        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-tertiary"></i>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black-secondary border border-gray-primary rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-4 text-center text-gray-tertiary">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Searching...
            </div>
          ) : (
            <>
              {searchResults?.tracks?.items?.length > 0 && (
                <div className="p-2">
                  <h3 className="text-sm font-semibold text-gray-secondary uppercase tracking-wider mb-2 px-2">Tracks</h3>
                  {searchResults.tracks.items.map((track: any) => (
                    <Button
                      key={track.id}
                      variant="ghost"
                      className="w-full justify-start p-2 hover:bg-black-tertiary"
                      onClick={() => handleTrackSelect(track)}
                    >
                      <img
                        src={track.album.images?.[0]?.url || '/placeholder-album.png'}
                        alt={track.name}
                        className="w-10 h-10 rounded mr-3 object-cover"
                      />
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium truncate">{track.name}</p>
                        <p className="text-gray-tertiary text-sm truncate">
                          {track.artists.map((artist: any) => artist.name).join(', ')}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {searchResults?.artists?.items?.length > 0 && (
                <div className="p-2 border-t border-gray-primary">
                  <h3 className="text-sm font-semibold text-gray-secondary uppercase tracking-wider mb-2 px-2">Artists</h3>
                  {searchResults.artists.items.slice(0, 3).map((artist: any) => (
                    <Button
                      key={artist.id}
                      variant="ghost"
                      className="w-full justify-start p-2 hover:bg-black-tertiary"
                    >
                      <img
                        src={artist.images?.[0]?.url || '/placeholder-artist.png'}
                        alt={artist.name}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                      />
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium truncate">{artist.name}</p>
                        <p className="text-gray-tertiary text-sm">Artist</p>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {searchResults?.albums?.items?.length > 0 && (
                <div className="p-2 border-t border-gray-primary">
                  <h3 className="text-sm font-semibold text-gray-secondary uppercase tracking-wider mb-2 px-2">Albums</h3>
                  {searchResults.albums.items.slice(0, 3).map((album: any) => (
                    <Button
                      key={album.id}
                      variant="ghost"
                      className="w-full justify-start p-2 hover:bg-black-tertiary"
                    >
                      <img
                        src={album.images?.[0]?.url || '/placeholder-album.png'}
                        alt={album.name}
                        className="w-10 h-10 rounded mr-3 object-cover"
                      />
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium truncate">{album.name}</p>
                        <p className="text-gray-tertiary text-sm truncate">
                          {album.artists.map((artist: any) => artist.name).join(', ')}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
