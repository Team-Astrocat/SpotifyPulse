import { useSpotify } from "@/hooks/use-spotify";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { login } = useSpotify();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if user just authenticated
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('authenticated') === 'true') {
      setLocation('/');
    }
    
    const error = urlParams.get('error');
    if (error) {
      console.error('Authentication error:', error);
    }
  }, [setLocation]);

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black-primary via-black-secondary to-red-dark animate-fade-in">
      <div className="max-w-md w-full mx-4">
        <Card className="bg-black-secondary border-gray-primary shadow-2xl animate-slide-up">
          <CardContent className="p-8">
            {/* Logo/Brand */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-music text-white text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-white">RedTunes</h1>
              <p className="text-gray-tertiary mt-2">Custom Spotify Client</p>
            </div>

            {/* Login Form */}
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-secondary mb-6">Connect your Spotify account to get started</p>
                <Button 
                  onClick={handleLogin}
                  className="w-full bg-red-primary hover:bg-red-secondary text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-3"
                >
                  <i className="fab fa-spotify text-xl"></i>
                  <span>Login with Spotify</span>
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-tertiary">
                  By logging in, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
