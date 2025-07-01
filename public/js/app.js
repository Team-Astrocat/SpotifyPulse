// RedTunes - Custom Spotify Client
// Main application logic

class RedTunesApp {
    constructor() {
        this.isAuthenticated = false;
        this.user = null;
        this.currentTrack = null;
        this.isPlaying = false;
        this.volume = 50;
        this.progress = 0;
        this.shuffleEnabled = false;
        this.repeatMode = 'off'; // off, track, context
        this.player = null;
        this.deviceId = null;
        this.searchTimeout = null;
        
        // Initialize the app
        this.init();
    }

    init() {
        // Check authentication status
        this.checkAuthStatus();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set greeting
        this.setGreeting();
        
        // Initialize Spotify player if authenticated
        if (window.Spotify) {
            this.initSpotifyPlayer();
        } else {
            window.onSpotifyWebPlaybackSDKReady = () => {
                this.initSpotifyPlayer();
            };
        }
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/user/me');
            if (response.ok) {
                this.user = await response.json();
                this.isAuthenticated = true;
                this.showMainApp();
                this.loadUserData();
            } else {
                this.showLoginScreen();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showLoginScreen();
        }
    }

    showLoginScreen() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
    }

    setupEventListeners() {
        // Login button
        document.getElementById('login-btn').addEventListener('click', () => {
            window.location.href = '/api/auth/login';
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.switchPage(page);
            });
        });

        // Search
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.search(query);
                }, 300);
            } else {
                this.hideSearchResults();
            }
        });

        // Player controls
        document.getElementById('play-pause-btn').addEventListener('click', () => {
            this.togglePlayPause();
        });

        document.getElementById('prev-btn').addEventListener('click', () => {
            this.previousTrack();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextTrack();
        });

        document.getElementById('shuffle-btn').addEventListener('click', () => {
            this.toggleShuffle();
        });

        document.getElementById('repeat-btn').addEventListener('click', () => {
            this.toggleRepeat();
        });

        document.getElementById('like-btn').addEventListener('click', () => {
            this.toggleLike();
        });

        // Progress bar
        const progressContainer = document.querySelector('.progress-container');
        progressContainer.addEventListener('click', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.seek(percent);
        });

        // Volume control
        const volumeSlider = document.querySelector('.volume-slider');
        volumeSlider.addEventListener('click', (e) => {
            const rect = volumeSlider.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.setVolume(percent * 100);
        });

        // URL parameters check (for auth callback)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('authenticated') === 'true') {
            window.history.replaceState({}, document.title, '/');
            this.checkAuthStatus();
        }
    }

    async logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            this.isAuthenticated = false;
            this.user = null;
            this.currentTrack = null;
            this.isPlaying = false;
            if (this.player) {
                this.player.disconnect();
                this.player = null;
            }
            this.showLoginScreen();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    switchPage(pageName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

        // Update page content
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(`${pageName}-page`).classList.add('active');

        // Load page-specific content
        switch (pageName) {
            case 'home':
                this.loadHomeContent();
                break;
            case 'search':
                this.loadSearchContent();
                break;
            case 'library':
                this.loadLibraryContent();
                break;
        }
    }

    setGreeting() {
        const hour = new Date().getHours();
        let greeting = 'Good morning';
        if (hour >= 12 && hour < 18) {
            greeting = 'Good afternoon';
        } else if (hour >= 18) {
            greeting = 'Good evening';
        }
        document.getElementById('greeting').textContent = greeting;
    }

    async loadUserData() {
        if (!this.isAuthenticated) return;

        // Update user profile in sidebar
        const userName = document.querySelector('.user-name');
        const userPlan = document.querySelector('.user-plan');
        const userAvatars = document.querySelectorAll('.user-avatar');

        if (userName) userName.textContent = this.user.displayName || 'User';
        if (userPlan) userPlan.textContent = this.user.product || 'Free';

        userAvatars.forEach(avatar => {
            if (this.user.profileImage) {
                avatar.innerHTML = `<img src="${this.user.profileImage}" alt="Profile" />`;
            }
        });

        // Load user playlists
        this.loadPlaylists();
        
        // Load home content
        this.loadHomeContent();
    }

    async loadPlaylists() {
        try {
            const response = await fetch('/api/spotify/me/playlists?limit=20');
            if (response.ok) {
                const data = await response.json();
                this.renderPlaylists(data.items || []);
            }
        } catch (error) {
            console.error('Failed to load playlists:', error);
        }
    }

    renderPlaylists(playlists) {
        const playlistsList = document.getElementById('playlists-list');
        playlistsList.innerHTML = '';

        playlists.forEach(playlist => {
            const playlistItem = document.createElement('button');
            playlistItem.className = 'playlist-item';
            playlistItem.textContent = playlist.name;
            playlistItem.addEventListener('click', () => {
                this.playPlaylist(playlist);
            });
            playlistsList.appendChild(playlistItem);
        });
    }

    async loadHomeContent() {
        this.loadRecentlyPlayed();
        this.loadRecommendations();
        this.loadQuickAccess();
    }

    async loadRecentlyPlayed() {
        try {
            const response = await fetch('/api/spotify/me/player/recently-played?limit=10');
            if (response.ok) {
                const data = await response.json();
                this.renderMusicGrid('recently-played', data.items || []);
            }
        } catch (error) {
            console.error('Failed to load recently played:', error);
        }
    }

    async loadRecommendations() {
        try {
            const response = await fetch('/api/spotify/recommendations?seed_genres=pop,rock,electronic&limit=10');
            if (response.ok) {
                const data = await response.json();
                this.renderMusicGrid('recommendations', data.tracks || []);
            }
        } catch (error) {
            console.error('Failed to load recommendations:', error);
        }
    }

    async loadQuickAccess() {
        try {
            const response = await fetch('/api/spotify/me/playlists?limit=6');
            if (response.ok) {
                const data = await response.json();
                this.renderQuickAccess(data.items || []);
            }
        } catch (error) {
            console.error('Failed to load quick access:', error);
        }
    }

    renderQuickAccess(playlists) {
        const quickAccess = document.getElementById('quick-access');
        quickAccess.innerHTML = '';

        playlists.forEach(playlist => {
            const item = document.createElement('div');
            item.className = 'quick-access-item';
            item.innerHTML = `
                <img src="${playlist.images?.[0]?.url || '/placeholder-album.png'}" alt="${playlist.name}" />
                <div class="quick-access-info">
                    <h3>${playlist.name}</h3>
                    <p>${playlist.tracks.total} songs</p>
                </div>
            `;
            item.addEventListener('click', () => {
                this.playPlaylist(playlist);
            });
            quickAccess.appendChild(item);
        });
    }

    renderMusicGrid(containerId, items) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        items.forEach(item => {
            const track = item.track || item;
            const musicItem = document.createElement('div');
            musicItem.className = 'music-item';
            musicItem.innerHTML = `
                <img src="${track.album?.images?.[0]?.url || '/placeholder-album.png'}" alt="${track.name}" />
                <h3>${track.name}</h3>
                <p>${track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}</p>
                <button class="play-btn-overlay">
                    <i class="fas fa-play"></i>
                </button>
            `;
            musicItem.addEventListener('click', () => {
                this.playTrack(track);
            });
            container.appendChild(musicItem);
        });
    }

    async search(query) {
        try {
            const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&type=track,artist,album&limit=20`);
            if (response.ok) {
                const data = await response.json();
                this.showSearchResults(data);
            }
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    showSearchResults(results) {
        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '';

        // Add tracks
        if (results.tracks?.items?.length > 0) {
            const tracksSection = document.createElement('div');
            tracksSection.innerHTML = `
                <div style="padding: 8px 16px; font-size: 12px; font-weight: 600; color: var(--gray-secondary); text-transform: uppercase;">Tracks</div>
            `;
            
            results.tracks.items.slice(0, 5).forEach(track => {
                const trackItem = document.createElement('div');
                trackItem.style.cssText = 'padding: 8px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.15s;';
                trackItem.innerHTML = `
                    <img src="${track.album.images?.[0]?.url || '/placeholder-album.png'}" 
                         style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;" />
                    <div style="flex: 1; min-width: 0;">
                        <div style="color: var(--white-primary); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${track.name}</div>
                        <div style="color: var(--gray-tertiary); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${track.artists.map(a => a.name).join(', ')}</div>
                    </div>
                `;
                trackItem.addEventListener('mouseenter', () => {
                    trackItem.style.backgroundColor = 'var(--black-tertiary)';
                });
                trackItem.addEventListener('mouseleave', () => {
                    trackItem.style.backgroundColor = 'transparent';
                });
                trackItem.addEventListener('click', () => {
                    this.playTrack(track);
                    this.hideSearchResults();
                });
                tracksSection.appendChild(trackItem);
            });
            
            searchResults.appendChild(tracksSection);
        }

        searchResults.classList.remove('hidden');
    }

    hideSearchResults() {
        document.getElementById('search-results').classList.add('hidden');
    }

    loadSearchContent() {
        // Implementation for search page content
    }

    loadLibraryContent() {
        // Implementation for library page content
    }

    async initSpotifyPlayer() {
        if (!this.isAuthenticated || !this.user) return;

        try {
            this.player = new Spotify.Player({
                name: 'RedTunes Player',
                getOAuthToken: cb => {
                    cb(this.user.accessToken);
                },
                volume: this.volume / 100
            });

            // Error handling
            this.player.addListener('initialization_error', ({ message }) => {
                console.error('Initialization Error:', message);
            });

            this.player.addListener('authentication_error', ({ message }) => {
                console.error('Authentication Error:', message);
            });

            this.player.addListener('account_error', ({ message }) => {
                console.error('Account Error:', message);
            });

            this.player.addListener('playback_error', ({ message }) => {
                console.error('Playback Error:', message);
            });

            // Ready
            this.player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                this.deviceId = device_id;
            });

            // Not Ready
            this.player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            // Player state changed
            this.player.addListener('player_state_changed', (state) => {
                if (!state) return;

                this.updatePlayerState(state);
            });

            // Connect to the player
            const connected = await this.player.connect();
            if (connected) {
                console.log('Successfully connected to Spotify');
            }
        } catch (error) {
            console.error('Failed to initialize Spotify player:', error);
        }
    }

    updatePlayerState(state) {
        this.currentTrack = state.track_window.current_track;
        this.isPlaying = !state.paused;
        this.progress = state.position;

        // Update UI
        this.updateCurrentTrackDisplay();
        this.updatePlayButton();
        this.updateProgressBar();
    }

    updateCurrentTrackDisplay() {
        const trackName = document.getElementById('current-track-name');
        const trackArtist = document.getElementById('current-track-artist');
        const trackImage = document.getElementById('current-track-image');

        if (this.currentTrack) {
            trackName.textContent = this.currentTrack.name;
            trackArtist.textContent = this.currentTrack.artists.map(a => a.name).join(', ');
            trackImage.src = this.currentTrack.album.images[0]?.url || '/placeholder-album.png';
        } else {
            trackName.textContent = 'Select a song';
            trackArtist.textContent = 'Unknown Artist';
            trackImage.src = '/placeholder-album.png';
        }
    }

    updatePlayButton() {
        const playBtn = document.getElementById('play-pause-btn');
        const icon = playBtn.querySelector('i');
        icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    updateProgressBar() {
        if (!this.currentTrack) return;

        const progressBar = document.getElementById('progress-bar');
        const progressHandle = document.getElementById('progress-handle');
        const currentTime = document.getElementById('current-time');
        const totalTime = document.getElementById('total-time');

        const percent = (this.progress / this.currentTrack.duration_ms) * 100;
        progressBar.style.width = `${percent}%`;
        progressHandle.style.left = `${percent}%`;

        currentTime.textContent = this.formatTime(this.progress);
        totalTime.textContent = this.formatTime(this.currentTrack.duration_ms);
    }

    formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    async playTrack(track) {
        if (!this.player || !this.deviceId) {
            console.error('Player not ready');
            return;
        }

        try {
            await fetch(`/api/spotify/me/player/play?device_id=${this.deviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: [track.uri]
                })
            });
        } catch (error) {
            console.error('Failed to play track:', error);
        }
    }

    async playPlaylist(playlist) {
        if (!this.player || !this.deviceId) {
            console.error('Player not ready');
            return;
        }

        try {
            await fetch(`/api/spotify/me/player/play?device_id=${this.deviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    context_uri: playlist.uri
                })
            });
        } catch (error) {
            console.error('Failed to play playlist:', error);
        }
    }

    async togglePlayPause() {
        if (!this.player) return;

        try {
            if (this.isPlaying) {
                await fetch('/api/spotify/me/player/pause', { method: 'PUT' });
            } else {
                await fetch('/api/spotify/me/player/play', { method: 'PUT' });
            }
        } catch (error) {
            console.error('Failed to toggle play/pause:', error);
        }
    }

    async previousTrack() {
        if (!this.player) return;

        try {
            await fetch('/api/spotify/me/player/previous', { method: 'POST' });
        } catch (error) {
            console.error('Failed to go to previous track:', error);
        }
    }

    async nextTrack() {
        if (!this.player) return;

        try {
            await fetch('/api/spotify/me/player/next', { method: 'POST' });
        } catch (error) {
            console.error('Failed to go to next track:', error);
        }
    }

    async toggleShuffle() {
        this.shuffleEnabled = !this.shuffleEnabled;
        const shuffleBtn = document.getElementById('shuffle-btn');
        
        if (this.shuffleEnabled) {
            shuffleBtn.classList.add('active');
        } else {
            shuffleBtn.classList.remove('active');
        }

        try {
            await fetch(`/api/spotify/me/player/shuffle?state=${this.shuffleEnabled}`, { method: 'PUT' });
        } catch (error) {
            console.error('Failed to toggle shuffle:', error);
        }
    }

    toggleRepeat() {
        const modes = ['off', 'track', 'context'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];

        const repeatBtn = document.getElementById('repeat-btn');
        const icon = repeatBtn.querySelector('i');
        
        if (this.repeatMode === 'off') {
            repeatBtn.classList.remove('active');
            icon.className = 'fas fa-redo';
        } else {
            repeatBtn.classList.add('active');
            icon.className = this.repeatMode === 'track' ? 'fas fa-redo' : 'fas fa-redo';
        }

        // API call for repeat mode
        fetch(`/api/spotify/me/player/repeat?state=${this.repeatMode}`, { method: 'PUT' })
            .catch(error => console.error('Failed to set repeat mode:', error));
    }

    toggleLike() {
        const likeBtn = document.getElementById('like-btn');
        const icon = likeBtn.querySelector('i');
        
        if (likeBtn.classList.contains('liked')) {
            likeBtn.classList.remove('liked');
            icon.className = 'far fa-heart';
        } else {
            likeBtn.classList.add('liked');
            icon.className = 'fas fa-heart';
        }
    }

    async seek(percent) {
        if (!this.currentTrack) return;

        const position = Math.floor(this.currentTrack.duration_ms * percent);
        
        try {
            await fetch(`/api/spotify/me/player/seek?position_ms=${position}`, { method: 'PUT' });
        } catch (error) {
            console.error('Failed to seek:', error);
        }
    }

    async setVolume(volume) {
        this.volume = Math.max(0, Math.min(100, volume));
        
        const volumeFill = document.getElementById('volume-fill');
        const volumeHandle = document.getElementById('volume-handle');
        const volumeIcon = document.querySelector('#volume-btn i');
        
        volumeFill.style.width = `${this.volume}%`;
        volumeHandle.style.left = `${this.volume}%`;
        
        // Update volume icon
        if (this.volume === 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (this.volume < 50) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }

        try {
            if (this.player) {
                await this.player.setVolume(this.volume / 100);
            }
            await fetch(`/api/spotify/me/player/volume?volume_percent=${Math.floor(this.volume)}`, { method: 'PUT' });
        } catch (error) {
            console.error('Failed to set volume:', error);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.redTunes = new RedTunesApp();
});

// Handle auth callback
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('authenticated') === 'true') {
        window.history.replaceState({}, document.title, '/');
        if (window.redTunes) {
            window.redTunes.checkAuthStatus();
        }
    }
});