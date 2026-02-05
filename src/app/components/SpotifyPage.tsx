import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Music, Lock, Unlock } from 'lucide-react';
import { motion } from 'motion/react';

const API_BASE = '';

interface TrackInfo {
  track: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: string;
  currentTime: string;
  progress: number;
  isPlaying: boolean;
}

interface ExtractedColors {
  primary: string;
  secondary: string;
  accent: string;
}

// Extract dominant colors from an image using canvas
function extractColors(imageUrl: string): Promise<ExtractedColors> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ primary: '#8B5CF6', secondary: '#EC4899', accent: '#F59E0B' });
        return;
      }
      
      // Sample at smaller size for performance
      const size = 50;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
      
      const imageData = ctx.getImageData(0, 0, size, size).data;
      const colorBuckets: Map<string, { r: number; g: number; b: number; count: number }> = new Map();
      
      // Sample pixels and bucket by color similarity
      for (let i = 0; i < imageData.length; i += 4) {
        const r = Math.floor(imageData[i] / 32) * 32;
        const g = Math.floor(imageData[i + 1] / 32) * 32;
        const b = Math.floor(imageData[i + 2] / 32) * 32;
        
        // Skip very dark or very light colors
        const brightness = (r + g + b) / 3;
        if (brightness < 30 || brightness > 230) continue;
        
        const key = `${r},${g},${b}`;
        const existing = colorBuckets.get(key);
        if (existing) {
          existing.count++;
        } else {
          colorBuckets.set(key, { r, g, b, count: 1 });
        }
      }
      
      // Sort by count and get top colors
      const sorted = Array.from(colorBuckets.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      if (sorted.length === 0) {
        resolve({ primary: '#8B5CF6', secondary: '#EC4899', accent: '#F59E0B' });
        return;
      }
      
      // Pick colors with good contrast
      const toHex = (c: { r: number; g: number; b: number }) => 
        `#${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`;
      
      const primary = sorted[0];
      const secondary = sorted[1] || sorted[0];
      const accent = sorted[2] || sorted[1] || sorted[0];
      
      resolve({
        primary: toHex(primary),
        secondary: toHex(secondary),
        accent: toHex(accent)
      });
    };
    
    img.onerror = () => {
      resolve({ primary: '#8B5CF6', secondary: '#EC4899', accent: '#F59E0B' });
    };
    
    img.src = imageUrl;
  });
}

interface SpotifyPageProps {
  locked?: boolean;
  onLockChange?: (locked: boolean) => void;
}

export function SpotifyPage({ locked = false, onLockChange }: SpotifyPageProps) {
  const [nowPlaying, setNowPlaying] = useState<TrackInfo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [colorPhase, setColorPhase] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [colors, setColors] = useState<ExtractedColors>({
    primary: '#8B5CF6',
    secondary: '#EC4899',
    accent: '#F59E0B',
  });
  const lastAlbumArt = useRef<string>('');
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [showLockMessage, setShowLockMessage] = useState(false);

  const [queue, setQueue] = useState<{track: string; artist: string}[]>([]);

  // Long-press to lock/unlock (3 seconds)
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      const newLockState = !locked;
      onLockChange?.(newLockState);
      
      // Show confirmation message
      setShowLockMessage(true);
      setTimeout(() => setShowLockMessage(false), 2000);
    }, 3000);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Extract colors when album art changes
  useEffect(() => {
    if (nowPlaying?.albumArt && nowPlaying.albumArt !== lastAlbumArt.current) {
      lastAlbumArt.current = nowPlaying.albumArt;
      extractColors(nowPlaying.albumArt).then(setColors);
    }
  }, [nowPlaying?.albumArt]);

  useEffect(() => {
    async function fetchNowPlaying() {
      try {
        const res = await fetch(`${API_BASE}/spotify/now-playing`);
        if (res.ok) {
          const data = await res.json();
          if (data.item) {
            const durationMs = data.item.duration_ms || 0;
            const progressMs = data.progress_ms || 0;
            
            setNowPlaying({
              track: data.item.name,
              artist: data.item.artists?.map((a: any) => a.name).join(', ') || '',
              album: data.item.album?.name || '',
              albumArt: data.item.album?.images?.[0]?.url || '',
              duration: formatTime(durationMs),
              currentTime: formatTime(progressMs),
              progress: durationMs > 0 ? (progressMs / durationMs) * 100 : 0,
              isPlaying: data.is_playing
            });
            setIsPlaying(data.is_playing);
            setIsConnected(true);
          } else {
            setIsConnected(true);
            setNowPlaying(null);
          }
        }
      } catch (e) {
        console.error('Spotify error:', e);
        setIsConnected(false);
      }
    }
    
    async function fetchQueue() {
      try {
        const res = await fetch(`${API_BASE}/spotify/queue`);
        if (res.ok) {
          const data = await res.json();
          const queueItems = (data.queue || []).slice(0, 3).map((item: any) => ({
            track: item.name,
            artist: item.artists?.map((a: any) => a.name).join(', ') || ''
          }));
          setQueue(queueItems);
        }
      } catch (e) {
        console.error('Queue error:', e);
      }
    }
    
    fetchNowPlaying();
    fetchQueue();
    const interval = setInterval(() => {
      fetchNowPlaying();
      fetchQueue();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  function formatTime(ms: number): string {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async function handlePlayPause() {
    try {
      await fetch(`${API_BASE}/spotify/${isPlaying ? 'pause' : 'play'}`, { method: 'POST' });
      setIsPlaying(!isPlaying);
    } catch (e) { console.error('Play/pause error:', e); }
  }

  async function handleNext() {
    try { await fetch(`${API_BASE}/spotify/next`, { method: 'POST' }); } 
    catch (e) { console.error('Next error:', e); }
  }

  async function handlePrev() {
    try { await fetch(`${API_BASE}/spotify/previous`, { method: 'POST' }); } 
    catch (e) { console.error('Prev error:', e); }
  }

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => setColorPhase((prev) => (prev + 1) % 3), 2000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const getGradient = () => {
    const { primary, secondary, accent } = colors;
    switch (colorPhase) {
      case 0: return `linear-gradient(135deg, ${primary}50, ${secondary}30)`;
      case 1: return `linear-gradient(135deg, ${secondary}50, ${accent}30)`;
      case 2: return `linear-gradient(135deg, ${accent}50, ${primary}30)`;
      default: return `linear-gradient(135deg, ${primary}50, ${secondary}30)`;
    }
  };

  if (!isConnected) {
    return (
      <div className="h-full p-8 flex flex-col items-center justify-center">
        <Music className="w-24 h-24 text-stone-400 mb-6" />
        <h2 className="text-2xl text-stone-600 mb-4">Spotify ikke tilkoblet</h2>
        <a href="/spotify/login" className="px-8 py-4 bg-stone-900 text-white rounded-2xl hover:bg-stone-800 transition-colors">
          Koble til Spotify
        </a>
      </div>
    );
  }

  if (!nowPlaying) {
    return (
      <div className="h-full p-8 flex flex-col items-center justify-center">
        <Music className="w-24 h-24 text-stone-400 mb-6" />
        <h2 className="text-2xl text-stone-600">Ingenting spiller</h2>
        <p className="text-stone-500 mt-2">Start avspilling fra Spotify-appen</p>
      </div>
    );
  }

  return (
    <div className="h-full p-5 pb-10 flex flex-col relative overflow-hidden">
      {/* Animated color background */}
      <motion.div 
        className="absolute inset-0 -z-10"
        animate={{ background: getGradient() }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Pulsing orbs */}
      {isPlaying && (
        <>
          <motion.div
            className="absolute w-96 h-96 rounded-full blur-3xl opacity-40"
            style={{ background: colors.primary }}
            animate={{ scale: [1, 1.2, 1], x: [100, 150, 100], y: [100, 150, 100] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-96 h-96 rounded-full blur-3xl opacity-40"
            style={{ background: colors.secondary }}
            animate={{ scale: [1.2, 1, 1.2], x: [800, 750, 800], y: [400, 350, 400] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </>
      )}

      <div className="grid grid-cols-[1.2fr_1fr] gap-6 flex-1 relative z-10">
        {/* Now Playing */}
        <motion.div 
          className={`bg-white/40 backdrop-blur-sm rounded-3xl border shadow-sm p-6 hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer relative ${
            locked ? 'border-amber-400 border-2' : 'border-stone-200/50'
          }`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          animate={{
            boxShadow: isPlaying 
              ? `0 0 40px ${colors.primary}20, 0 0 80px ${colors.secondary}10`
              : '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
          transition={{ duration: 2 }}
        >
          {/* Lock confirmation message */}
          {showLockMessage && (
            <motion.div 
              className="absolute inset-0 bg-stone-900/90 rounded-3xl flex items-center justify-center z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <Lock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <p className="text-white text-xl font-medium">{locked ? 'Vindu låst' : 'Vindu låst opp'}</p>
              </div>
            </motion.div>
          )}
          
          {/* Lock indicator */}
          {locked && (
            <div className="absolute top-3 right-3 bg-amber-100 text-amber-700 p-2 rounded-full z-10">
              <Lock className="w-4 h-4" />
            </div>
          )}
          {/* Album Cover */}
          <div className="flex items-center justify-center mb-5">
            <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              {nowPlaying.albumArt ? (
                <img src={nowPlaying.albumArt} alt={nowPlaying.album} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-300">
                  <Music className="w-12 h-12 text-stone-500" />
                </div>
              )}
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-medium text-stone-900 mb-1">{nowPlaying.track}</h2>
            <p className="text-lg text-stone-600">{nowPlaying.artist}</p>
            <p className="text-xs text-stone-500 mt-1">{nowPlaying.album}</p>
          </div>

          {/* Audio Waveform */}
          <div className="mb-4 flex items-center justify-center gap-1 h-12">
            {[...Array(40)].map((_, i) => {
              const randomHeight1 = 15 + Math.random() * 40;
              const randomHeight2 = 25 + Math.random() * 60;
              const randomHeight3 = 10 + Math.random() * 50;
              const randomDuration = 0.4 + Math.random() * 0.8;
              const randomDelay = Math.random() * 0.5;
              
              return (
                <motion.div
                  key={i}
                  className="w-1 bg-stone-900 rounded-full"
                  animate={isPlaying ? {
                    height: [`${randomHeight1}%`, `${randomHeight2}%`, `${randomHeight3}%`, `${randomHeight1}%`],
                  } : {
                    height: '15%'
                  }}
                  transition={{
                    duration: randomDuration,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                    delay: randomDelay
                  }}
                />
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setLiked(!liked)} className="w-12 h-12 rounded-full hover:bg-stone-100 active:scale-95 transition-all flex items-center justify-center">
              <Heart className={`w-5 h-5 ${liked ? 'fill-amber-600 text-amber-600' : 'text-stone-600'}`} />
            </button>
            <button onClick={handlePrev} className="w-12 h-12 rounded-full hover:bg-stone-100 active:scale-95 transition-all flex items-center justify-center">
              <SkipBack className="w-6 h-6 text-stone-900 fill-stone-900" />
            </button>
            <button onClick={handlePlayPause} className="w-16 h-16 rounded-full bg-stone-900 hover:bg-stone-800 active:scale-95 transition-all flex items-center justify-center shadow-lg">
              {isPlaying ? <Pause className="w-8 h-8 fill-white text-white" /> : <Play className="w-8 h-8 fill-white text-white ml-1" />}
            </button>
            <button onClick={handleNext} className="w-12 h-12 rounded-full hover:bg-stone-100 active:scale-95 transition-all flex items-center justify-center">
              <SkipForward className="w-6 h-6 text-stone-900 fill-stone-900" />
            </button>
            <button className="w-12 h-12 rounded-full hover:bg-stone-100 active:scale-95 transition-all flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-stone-600" />
            </button>
          </div>
        </motion.div>

        {/* Queue */}
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-8 hover:shadow-lg transition-all duration-300">
          <h2 className="text-sm uppercase tracking-wider text-stone-600 font-medium mb-6">
            Neste i køen
          </h2>
          {queue.length > 0 ? (
            <div className="space-y-4">
              {queue.map((song, i) => (
                <div key={i} className="p-4 rounded-2xl hover:bg-white/60 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-stone-200 flex items-center justify-center text-stone-600 font-medium group-hover:bg-stone-900 group-hover:text-white transition-colors">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-medium text-stone-900 truncate">{song.track}</div>
                      <div className="text-sm text-stone-600 truncate">{song.artist}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-stone-500">
              Ingen sanger i køen
            </div>
          )}
          <button className="w-full mt-6 py-4 rounded-2xl border-2 border-dashed border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-white/40 transition-all text-sm uppercase tracking-wider font-medium">
            Se hele køen
          </button>
        </div>
      </div>
    </div>
  );
}
