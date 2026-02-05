import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function SpotifyPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState(45);
  const [colorPhase, setColorPhase] = useState(0);

  const nowPlaying = {
    track: 'Northern Lights',
    artist: 'Aurora',
    album: 'All My Demons Greeting Me As A Friend',
    albumArt: 'https://images.unsplash.com/photo-1616663395403-2e0052b8e595?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGFsYnVtfGVufDF8fHx8MTc3MDIyMzk2OHww&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '3:42',
    currentTime: '1:40',
    // Color theme for this track
    colors: {
      primary: '#8B5CF6',    // Purple
      secondary: '#EC4899',  // Pink
      accent: '#F59E0B',     // Amber
    }
  };

  const queue = [
    { track: 'Runaway', artist: 'Aurora', duration: '5:10' },
    { track: 'The River', artist: 'Aurora', duration: '4:12' },
    { track: 'Running With The Wolves', artist: 'Aurora', duration: '3:14' },
  ];

  // Animate colors when playing
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setColorPhase((prev) => (prev + 1) % 3);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Get current gradient based on phase
  const getGradient = () => {
    const { primary, secondary, accent } = nowPlaying.colors;
    
    switch (colorPhase) {
      case 0:
        return `linear-gradient(135deg, ${primary}15, ${secondary}10)`;
      case 1:
        return `linear-gradient(135deg, ${secondary}15, ${accent}10)`;
      case 2:
        return `linear-gradient(135deg, ${accent}15, ${primary}10)`;
      default:
        return `linear-gradient(135deg, ${primary}15, ${secondary}10)`;
    }
  };

  return (
    <div className="h-full p-8 flex flex-col relative overflow-hidden">
      {/* Animated color background */}
      <motion.div 
        className="absolute inset-0 -z-10"
        animate={{
          background: getGradient(),
        }}
        transition={{
          duration: 2,
          ease: "easeInOut"
        }}
      />

      {/* Pulsing orbs */}
      {isPlaying && (
        <>
          <motion.div
            className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: nowPlaying.colors.primary }}
            animate={{
              scale: [1, 1.2, 1],
              x: [100, 150, 100],
              y: [100, 150, 100],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: nowPlaying.colors.secondary }}
            animate={{
              scale: [1.2, 1, 1.2],
              x: [800, 750, 800],
              y: [400, 350, 400],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </>
      )}

      {/* Header */}
      <div className="mb-8 relative z-10">
        <h1 className="text-4xl font-light text-stone-900 mb-2">Spiller nå</h1>
        <p className="text-xl text-stone-600">Spotify</p>
      </div>

      <div className="grid grid-cols-[1.2fr_1fr] gap-6 flex-1 relative z-10">
        {/* Now Playing */}
        <motion.div 
          className="bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-10 hover:shadow-lg transition-all duration-300 flex flex-col"
          animate={{
            boxShadow: isPlaying 
              ? `0 0 40px ${nowPlaying.colors.primary}20, 0 0 80px ${nowPlaying.colors.secondary}10`
              : '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
          transition={{ duration: 2 }}
        >
          
          {/* Vinyl Record */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              {/* Vinyl */}
              <div
                className={`w-64 h-64 rounded-full bg-gradient-to-br from-stone-800 via-stone-700 to-stone-800 relative shadow-2xl transition-transform duration-300 ${
                  isPlaying ? 'animate-spin-slow' : ''
                }`}
                style={{ animationDuration: '4s' }}
              >
                {/* Grooves */}
                <div className="absolute inset-1 rounded-full opacity-10 bg-[repeating-radial-gradient(circle_at_center,transparent_0px,transparent_2px,white_2px,white_3px)]"></div>
                
                {/* Center label with album art */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-stone-200 overflow-hidden shadow-lg">
                  <ImageWithFallback 
                    src={nowPlaying.albumArt} 
                    alt={nowPlaying.album}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-stone-900"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-medium text-stone-900 mb-2">
              {nowPlaying.track}
            </h2>
            <p className="text-xl text-stone-600">{nowPlaying.artist}</p>
            <p className="text-sm text-stone-500 mt-2">{nowPlaying.album}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-stone-900 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-stone-500">
              <span>{nowPlaying.currentTime}</span>
              <span>{nowPlaying.duration}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={() => setLiked(!liked)}
              className="w-14 h-14 rounded-full hover:bg-stone-100 active:scale-95 transition-all flex items-center justify-center"
            >
              <Heart className={`w-6 h-6 ${liked ? 'fill-amber-600 text-amber-600' : 'text-stone-600'}`} />
            </button>
            <button className="w-14 h-14 rounded-full hover:bg-stone-100 active:scale-95 transition-all flex items-center justify-center">
              <SkipBack className="w-7 h-7 text-stone-900 fill-stone-900" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 rounded-full bg-stone-900 hover:bg-stone-800 active:scale-95 transition-all flex items-center justify-center shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-10 h-10 fill-white text-white" />
              ) : (
                <Play className="w-10 h-10 fill-white text-white ml-1" />
              )}
            </button>
            <button className="w-14 h-14 rounded-full hover:bg-stone-100 active:scale-95 transition-all flex items-center justify-center">
              <SkipForward className="w-7 h-7 text-stone-900 fill-stone-900" />
            </button>
            <button className="w-14 h-14 rounded-full hover:bg-stone-100 active:scale-95 transition-all flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-stone-600" />
            </button>
          </div>
        </motion.div>

        {/* Queue */}
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-8 hover:shadow-lg transition-all duration-300">
          <h2 className="text-sm uppercase tracking-wider text-stone-600 font-medium mb-6">
            Neste i køen
          </h2>
          <div className="space-y-4">
            {queue.map((song, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl hover:bg-white/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-stone-200 flex items-center justify-center text-stone-600 font-medium group-hover:bg-stone-900 group-hover:text-white transition-colors">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-medium text-stone-900 truncate">
                      {song.track}
                    </div>
                    <div className="text-sm text-stone-600 truncate">
                      {song.artist}
                    </div>
                  </div>
                  <span className="text-sm text-stone-500">{song.duration}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add more button */}
          <button className="w-full mt-6 py-4 rounded-2xl border-2 border-dashed border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-white/40 transition-all text-sm uppercase tracking-wider font-medium">
            Se hele køen
          </button>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </div>
  );
}