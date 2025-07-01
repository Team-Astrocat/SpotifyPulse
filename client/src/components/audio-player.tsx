import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";

interface AudioPlayerProps {
  currentTrack: any;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function AudioPlayer({ 
  currentTrack, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious 
}: AudioPlayerProps) {
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // off, track, context

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (value: number[]) => {
    setProgress(value[0]);
    // TODO: Seek to position in track
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    // TODO: Set volume in player
  };

  const toggleRepeat = () => {
    const modes = ['off', 'track', 'context'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'track':
        return 'fas fa-redo text-red-primary';
      case 'context':
        return 'fas fa-redo text-red-primary';
      default:
        return 'fas fa-redo text-gray-tertiary';
    }
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <footer className="bg-black-secondary border-t border-gray-primary p-4">
      <div className="flex items-center justify-between">
        
        {/* Current Track Info */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <img 
            src={currentTrack.album?.images?.[0]?.url || '/placeholder-album.png'} 
            alt={currentTrack.name}
            className="w-14 h-14 rounded object-cover"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-white truncate">{currentTrack.name}</h4>
            <p className="text-sm text-gray-tertiary truncate">
              {currentTrack.artists?.map((artist: any) => artist.name).join(', ') || 'Unknown Artist'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`${isLiked ? 'text-red-primary' : 'text-gray-tertiary'} hover:text-red-primary transition-colors w-8 h-8`}
            onClick={() => setIsLiked(!isLiked)}
          >
            <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
          </Button>
        </div>

        {/* Player Controls */}
        <div className="flex-1 max-w-md mx-8">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <Button
              variant="ghost"
              size="icon"
              className={`${isShuffle ? 'text-red-primary' : 'text-gray-tertiary'} hover:text-white transition-colors w-8 h-8`}
              onClick={() => setIsShuffle(!isShuffle)}
            >
              <i className="fas fa-random"></i>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-tertiary hover:text-white transition-colors w-8 h-8"
              onClick={onPrevious}
            >
              <i className="fas fa-step-backward"></i>
            </Button>
            <Button
              size="icon"
              className="w-10 h-10 bg-red-primary hover:bg-red-secondary rounded-full transition-colors"
              onClick={onPlayPause}
            >
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-white`}></i>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-tertiary hover:text-white transition-colors w-8 h-8"
              onClick={onNext}
            >
              <i className="fas fa-step-forward"></i>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-tertiary hover:text-white transition-colors w-8 h-8"
              onClick={toggleRepeat}
            >
              <i className={getRepeatIcon()}></i>
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-tertiary min-w-0">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1">
              <Slider
                value={[progress]}
                onValueChange={handleProgressChange}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            <span className="text-xs text-gray-tertiary min-w-0">
              {formatTime(currentTrack.duration_ms || 0)}
            </span>
          </div>
        </div>

        {/* Volume and Options */}
        <div className="flex items-center space-x-4 flex-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-tertiary hover:text-white transition-colors w-8 h-8"
          >
            <i className="fas fa-list"></i>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-tertiary hover:text-white transition-colors w-8 h-8"
          >
            <i className="fas fa-desktop"></i>
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-tertiary hover:text-white transition-colors w-8 h-8"
            >
              <i className={`fas ${volume === 0 ? 'fa-volume-mute' : volume < 50 ? 'fa-volume-down' : 'fa-volume-up'}`}></i>
            </Button>
            <div className="w-20">
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
