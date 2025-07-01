import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SidebarProps {
  user: any;
  playlists: any[];
  onLogout: () => void;
}

export default function Sidebar({ user, playlists, onLogout }: SidebarProps) {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="w-64 bg-black-secondary border-r border-gray-primary custom-scrollbar overflow-y-auto">
      <div className="p-4">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-red-primary rounded-full flex items-center justify-center">
            <i className="fas fa-music text-white text-sm"></i>
          </div>
          <h1 className="text-xl font-bold text-white">RedTunes</h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          <Button
            variant="ghost"
            className={`w-full justify-start space-x-3 ${
              activeTab === 'home' 
                ? 'text-red-primary bg-red-primary bg-opacity-20' 
                : 'text-gray-tertiary hover:text-white hover:bg-gray-primary'
            }`}
            onClick={() => setActiveTab('home')}
          >
            <i className="fas fa-home"></i>
            <span className="font-medium">Home</span>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start space-x-3 ${
              activeTab === 'search' 
                ? 'text-red-primary bg-red-primary bg-opacity-20' 
                : 'text-gray-tertiary hover:text-white hover:bg-gray-primary'
            }`}
            onClick={() => setActiveTab('search')}
          >
            <i className="fas fa-search"></i>
            <span>Search</span>
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start space-x-3 ${
              activeTab === 'library' 
                ? 'text-red-primary bg-red-primary bg-opacity-20' 
                : 'text-gray-tertiary hover:text-white hover:bg-gray-primary'
            }`}
            onClick={() => setActiveTab('library')}
          >
            <i className="fas fa-book-open"></i>
            <span>Your Library</span>
          </Button>
        </nav>

        {/* Playlists */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-secondary uppercase tracking-wider">Playlists</h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-tertiary hover:text-red-primary w-6 h-6"
            >
              <i className="fas fa-plus"></i>
            </Button>
          </div>
          <div className="space-y-1">
            {playlists.map((playlist) => (
              <Button
                key={playlist.id}
                variant="ghost"
                className="w-full justify-start text-gray-tertiary hover:text-white hover:bg-gray-primary text-sm p-2"
              >
                {playlist.name}
              </Button>
            ))}
          </div>
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-primary pt-4">
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-primary transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-red-primary flex items-center justify-center">
                  <i className="fas fa-user text-white text-sm"></i>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.displayName}</p>
              <p className="text-xs text-gray-tertiary">{user?.product || 'Free'}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6"
              onClick={onLogout}
            >
              <i className="fas fa-sign-out-alt text-gray-tertiary text-sm"></i>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
