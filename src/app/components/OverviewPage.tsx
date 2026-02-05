import { useState, useEffect } from 'react';
import { Calendar, Bus, Music } from 'lucide-react';
import { WeatherIcon } from './WeatherIcon';

const API_BASE = '';

const CONDITIONS: Record<string, string> = {
  clearsky: 'Klarvær', fair: 'Lettskyet', partlycloudy: 'Delvis skyet',
  cloudy: 'Overskyet', rain: 'Regn', lightrain: 'Lett regn',
  heavyrain: 'Kraftig regn', snow: 'Snø', sleet: 'Sludd', fog: 'Tåke'
};

interface OverviewPageProps {
  onNavigate: (index: number) => void;
}

interface Event {
  time: string;
  title: string;
  owner: string;
}

interface BusInfo {
  line: string;
  destination: string;
  time: string;
}

interface WeatherInfo {
  temp: number;
  symbol: string;
  condition: string;
}

interface SpotifyInfo {
  track: string;
  artist: string;
  isPlaying: boolean;
}

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const [clock, setClock] = useState('00:00');
  const [date, setDate] = useState('');
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [nextBus, setNextBus] = useState<BusInfo>({ line: '--', destination: '--', time: '--' });
  const [weather, setWeather] = useState<WeatherInfo>({ temp: 0, symbol: 'cloudy', condition: '--' });
  const [spotify, setSpotify] = useState<SpotifyInfo>({ track: 'Ikke tilkoblet', artist: '', isPlaying: false });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString('no-NO', { weekday: 'long', day: 'numeric', month: 'long' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch weather
  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(`${API_BASE}/weather`);
        const data = await res.json();
        const current = data.properties?.timeseries?.[0];
        if (current) {
          const temp = Math.round(current.data.instant.details.air_temperature);
          const symbol = current.data.next_1_hours?.summary?.symbol_code || 'cloudy';
          setWeather({ temp, symbol, condition: CONDITIONS[symbol.split('_')[0]] || symbol });
        }
      } catch (e) { console.error('Weather error:', e); }
    }
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  // Fetch calendar (endpoint is /events) - show upcoming events
  useEffect(() => {
    async function fetchCalendar() {
      try {
        const res = await fetch(`${API_BASE}/events`);
        const events = await res.json();
        const now = new Date();
        
        // Filter future events and sort by start time
        const upcomingEvents = events
          .filter((e: any) => new Date(e.start) > now)
          .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime())
          .slice(0, 3)
          .map((e: any) => {
            const eventDate = new Date(e.start);
            const isToday = eventDate.toDateString() === now.toDateString();
            const isTomorrow = eventDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
            
            let datePrefix = '';
            if (isToday) datePrefix = 'I dag';
            else if (isTomorrow) datePrefix = 'I morgen';
            else datePrefix = eventDate.toLocaleDateString('no-NO', { weekday: 'short', day: 'numeric', month: 'short' });
            
            return {
              time: `${datePrefix} ${eventDate.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}`,
              title: e.oppsummering || e.title || 'Ingen tittel',
              owner: e.organizer_email?.includes('ida') ? 'ida' : 'cornelius'
            };
          });
        setTodayEvents(upcomingEvents);
      } catch (e) { console.error('Calendar error:', e); }
    }
    fetchCalendar();
    const interval = setInterval(fetchCalendar, 300000);
    return () => clearInterval(interval);
  }, []);

  // Fetch bus directly from Entur
  useEffect(() => {
    async function fetchBus() {
      const query = `{
        stop0: stopPlace(id: "NSR:StopPlace:6372") {
          estimatedCalls(timeRange: 7200, numberOfDepartures: 10) {
            expectedDepartureTime
            destinationDisplay { frontText }
            serviceJourney { journeyPattern { line { publicCode } } }
          }
        }
      }`;
      
      try {
        const res = await fetch('https://api.entur.io/journey-planner/v3/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ET-Client-Name': 'hjemme-dashboard' },
          body: JSON.stringify({ query })
        });
        const data = await res.json();
        const calls = data.data?.stop0?.estimatedCalls || [];
        
        // Filter for relevant buses
        const relevant = calls.filter((d: any) => {
          const line = d.serviceJourney.journeyPattern.line.publicCode;
          const dest = d.destinationDisplay.frontText;
          return (line === '54' && dest === 'Kværnerbyen') || 
                 (line === '37' && dest === 'Helsfyr');
        });
        
        // Find first bus departing in 3+ minutes (skip buses leaving too soon)
        const validBus = relevant.find(bus => {
          const mins = Math.round((new Date(bus.expectedDepartureTime).getTime() - Date.now()) / 60000);
          return mins >= 3;
        });
        
        if (validBus) {
          const mins = Math.round((new Date(validBus.expectedDepartureTime).getTime() - Date.now()) / 60000);
          setNextBus({
            line: validBus.serviceJourney.journeyPattern.line.publicCode,
            destination: validBus.destinationDisplay.frontText,
            time: `${mins} min`
          });
        }
      } catch (e) { console.error('Bus error:', e); }
    }
    fetchBus();
    const interval = setInterval(fetchBus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Spotify
  useEffect(() => {
    async function fetchSpotify() {
      try {
        const res = await fetch(`${API_BASE}/spotify/now-playing`);
        if (res.ok) {
          const data = await res.json();
          if (data.item) {
            setSpotify({
              track: data.item.name,
              artist: data.item.artists?.map((a: any) => a.name).join(', ') || '',
              isPlaying: data.is_playing
            });
          }
        }
      } catch (e) { console.error('Spotify error:', e); }
    }
    fetchSpotify();
    const interval = setInterval(fetchSpotify, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full p-8 flex flex-col">
      {/* Large Clock */}
      <div className="text-center mb-10">
        <time className="block text-[120px] font-light tracking-tight text-stone-900 leading-none">
          {clock}
        </time>
        <div className="mt-2 text-2xl text-stone-600 capitalize">{date}</div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-3 gap-6 flex-1">
        
        {/* Weather Card */}
        <div 
          onClick={() => onNavigate(1)}
          className="bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-8 flex flex-col items-center justify-center group hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
          <div className="relative w-24 h-24 mb-4 transition-transform duration-500 group-hover:scale-110">
            <WeatherIcon symbol={weather.symbol} size={96} />
          </div>
          <div className="relative text-5xl font-light text-stone-900 mb-2">{weather.temp}°</div>
          <div className="relative text-lg text-stone-600">{weather.condition}</div>
          <div className="relative mt-4 text-sm text-stone-500 uppercase tracking-wider">Oslo</div>
        </div>

        {/* Calendar Card */}
        <div 
          onClick={() => onNavigate(2)}
          className="bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-8 flex flex-col group hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
          <div className="relative flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-stone-600" />
            <span className="text-sm uppercase tracking-wider text-stone-600 font-medium">Kommende</span>
          </div>
          <div className="relative space-y-4 flex-1">
            {todayEvents.map((event, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="text-xl font-medium text-stone-900 min-w-[70px]">
                  {event.time}
                </span>
                <div className="flex-1">
                  <div className="text-lg text-stone-700">{event.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${
                      event.owner === 'ida' ? 'bg-amber-600' : 'bg-stone-900'
                    }`}></span>
                    <span className="text-sm text-stone-500 capitalize">{event.owner}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bus & Music Combined Card */}
        <div className="flex flex-col gap-6">
          {/* Bus Card */}
          <div 
            onClick={() => onNavigate(3)}
            className="bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-6 group hover:shadow-lg transition-all duration-300 cursor-pointer flex-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="relative flex items-center gap-3 mb-4">
              <Bus className="w-5 h-5 text-stone-600" />
              <span className="text-xs uppercase tracking-wider text-stone-600 font-medium">Neste buss</span>
            </div>
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-stone-900 text-white flex items-center justify-center text-2xl font-semibold">
                {nextBus.line}
              </div>
              <div className="flex-1">
                <div className="text-base font-medium text-stone-900">
                  {nextBus.destination}
                </div>
                <div className="text-2xl font-light text-amber-600 mt-1">
                  {nextBus.time}
                </div>
              </div>
            </div>
          </div>

          {/* Music Card */}
          <div 
            onClick={() => onNavigate(4)}
            className="bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-6 group hover:shadow-lg transition-all duration-300 cursor-pointer flex-1 flex flex-col items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="relative">
              <Music className={`w-12 h-12 mb-3 mx-auto ${spotify.isPlaying ? 'text-green-600' : 'text-stone-600'}`} />
              <div className="text-base text-stone-700 text-center truncate max-w-[150px]">{spotify.track}</div>
              <div className="text-sm text-stone-500 text-center mt-1 truncate max-w-[150px]">{spotify.artist}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}