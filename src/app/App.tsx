import { useRef, useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectCreative } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-creative';

import { OverviewPage } from './components/OverviewPage';
import { WeatherPage } from './components/WeatherPage';
import { CalendarPage } from './components/CalendarPage';
import { BusPage } from './components/BusPage';
import { SpotifyPage } from './components/SpotifyPage';

const IDLE_TIMEOUT = 30000; // 30 seconds
const SPOTIFY_SLIDE_INDEX = 4;

export default function App() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [spotifyLocked, setSpotifyLocked] = useState(false);
  const idleTimerRef = useRef<number | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      // Don't auto-navigate if on Spotify and locked
      if (currentSlide === SPOTIFY_SLIDE_INDEX && spotifyLocked) {
        return;
      }
      // Return to overview
      if (currentSlide !== 0) {
        swiperRef.current?.slideTo(0);
      }
    }, IDLE_TIMEOUT);
  }, [currentSlide, spotifyLocked]);

  // Set up idle detection
  useEffect(() => {
    const events = ['touchstart', 'touchmove', 'click', 'mousemove', 'keydown'];
    
    const handleActivity = () => resetIdleTimer();
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
    
    resetIdleTimer();
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [resetIdleTimer]);

  return (
    <div className="w-[1280px] h-[720px] bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50 overflow-hidden">
      {/* Paper texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiAvPjwvc3ZnPg==')]"></div>

      <Swiper
        modules={[Pagination, EffectCreative]}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet !w-3 !h-3 !bg-stone-400',
          bulletActiveClass: '!bg-stone-900 !w-8 !rounded-full',
        }}
        effect="creative"
        creativeEffect={{
          prev: {
            translate: ['-100%', 0, -200],
            opacity: 0.5,
          },
          next: {
            translate: ['100%', 0, -200],
            opacity: 0.5,
          },
          limitProgress: 1,
        }}
        watchSlidesProgress={true}
        className="h-full"
        slidesPerView={1}
        spaceBetween={0}
        speed={500}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setCurrentSlide(swiper.activeIndex);
        }}
      >
        <SwiperSlide>
          <OverviewPage onNavigate={(index) => swiperRef.current?.slideTo(index)} />
        </SwiperSlide>
        <SwiperSlide>
          <WeatherPage />
        </SwiperSlide>
        <SwiperSlide>
          <CalendarPage />
        </SwiperSlide>
        <SwiperSlide>
          <BusPage />
        </SwiperSlide>
        <SwiperSlide>
          <SpotifyPage 
            locked={spotifyLocked} 
            onLockChange={setSpotifyLocked}
            isActive={currentSlide === SPOTIFY_SLIDE_INDEX}
          />
        </SwiperSlide>
      </Swiper>

      {/* Custom pagination styles */}
      <style>{`
        .swiper-pagination {
          bottom: 24px !important;
        }
        .swiper-pagination-bullet {
          transition: all 0.3s ease;
        }
        
        /* Hide slides that are not active or adjacent */
        .swiper-slide {
          pointer-events: none;
        }
        .swiper-slide-active,
        .swiper-slide-prev,
        .swiper-slide-next {
          pointer-events: auto;
        }
        
        /* Ensure proper z-index stacking */
        .swiper-slide-prev {
          z-index: 1 !important;
        }
        .swiper-slide-active {
          z-index: 2 !important;
        }
        .swiper-slide-next {
          z-index: 1 !important;
        }
        .swiper-slide:not(.swiper-slide-prev):not(.swiper-slide-active):not(.swiper-slide-next) {
          visibility: hidden;
        }
      `}</style>
    </div>
  );
}