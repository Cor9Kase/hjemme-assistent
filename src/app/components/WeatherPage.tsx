import { useState, useEffect } from 'react';
import { Wind, Droplets, Eye } from 'lucide-react';
import { WeatherIcon } from './WeatherIcon';

const API_BASE = '';

const CONDITIONS: Record<string, string> = {
  clearsky: 'Klarvær', fair: 'Lettskyet', partlycloudy: 'Delvis skyet',
  cloudy: 'Overskyet', rain: 'Regn', lightrain: 'Lett regn',
  heavyrain: 'Kraftig regn', snow: 'Snø', sleet: 'Sludd', fog: 'Tåke',
  rainshowers: 'Regnbyger', snowshowers: 'Snøbyger', thunder: 'Torden'
};

interface WeatherData {
  temp: number;
  condition: string;
  symbol: string;
  wind: number;
  humidity: number;
  feelsLike: number;
  hourly: { time: string; temp: number; symbol: string }[];
  daily: { day: string; high: number; low: number; symbol: string }[];
}

export function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 0, condition: '--', symbol: 'cloudy', wind: 0, humidity: 0, feelsLike: 0,
    hourly: [], daily: []
  });

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(`${API_BASE}/weather`);
        const data = await res.json();
        const timeseries = data.properties?.timeseries || [];
        
        if (timeseries.length === 0) return;
        
        const current = timeseries[0];
        const temp = Math.round(current.data.instant.details.air_temperature);
        const symbol = current.data.next_1_hours?.summary?.symbol_code || 'cloudy';
        const baseSymbol = symbol.split('_')[0];
        
        // Hourly forecast
        const hourly = timeseries.slice(1, 13).map((item: any) => ({
          time: new Date(item.time).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }),
          temp: Math.round(item.data.instant.details.air_temperature),
          symbol: item.data.next_1_hours?.summary?.symbol_code || 'cloudy'
        }));
        
        // Daily forecast
        const dailyData: Record<string, { temps: number[]; symbols: string[] }> = {};
        timeseries.forEach((item: any) => {
          const date = item.time.split('T')[0];
          if (!dailyData[date]) dailyData[date] = { temps: [], symbols: [] };
          dailyData[date].temps.push(item.data.instant.details.air_temperature);
          const sym = (item.data.next_1_hours || item.data.next_6_hours)?.summary?.symbol_code;
          if (sym) dailyData[date].symbols.push(sym);
        });
        
        const days = Object.entries(dailyData).slice(0, 4).map(([date, info], i) => {
          const dayName = i === 0 ? 'I dag' : new Date(date).toLocaleDateString('no-NO', { weekday: 'long' });
          return {
            day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
            high: Math.round(Math.max(...info.temps)),
            low: Math.round(Math.min(...info.temps)),
            symbol: info.symbols[Math.floor(info.symbols.length / 2)] || 'cloudy'
          };
        });
        
        setWeather({
          temp,
          condition: CONDITIONS[baseSymbol] || baseSymbol,
          symbol,
          wind: current.data.instant.details.wind_speed,
          humidity: Math.round(current.data.instant.details.relative_humidity),
          feelsLike: Math.round(temp - current.data.instant.details.wind_speed * 0.5),
          hourly,
          daily: days
        });
      } catch (e) {
        console.error('Weather fetch error:', e);
      }
    }
    
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full p-8 pb-16 flex flex-col overflow-y-auto">
      {/* Current Weather Hero */}
      <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-10 mb-6 group hover:shadow-lg transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 transition-transform duration-500 group-hover:scale-110">
              <WeatherIcon symbol={weather.symbol} size={128} />
            </div>
            <div>
              <div className="text-8xl font-light text-stone-900">{weather.temp}°</div>
              <div className="text-2xl text-stone-600 mt-2">{weather.condition}</div>
              <div className="text-lg text-stone-500 mt-2">Føles som {weather.feelsLike}°</div>
            </div>
          </div>

          {/* Weather details */}
          <div className="flex gap-8">
            <div className="text-center">
              <Wind className="w-8 h-8 text-stone-500 mx-auto mb-2" />
              <div className="text-2xl font-medium text-stone-900">{weather.wind}</div>
              <div className="text-sm text-stone-500 mt-1">m/s</div>
            </div>
            <div className="text-center">
              <Droplets className="w-8 h-8 text-stone-500 mx-auto mb-2" />
              <div className="text-2xl font-medium text-stone-900">{weather.humidity}</div>
              <div className="text-sm text-stone-500 mt-1">%</div>
            </div>
            <div className="text-center">
              <Eye className="w-8 h-8 text-stone-500 mx-auto mb-2" />
              <div className="text-2xl font-medium text-stone-900">{weather.visibility}</div>
              <div className="text-sm text-stone-500 mt-1">km</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly & Daily Forecast */}
      <div className="grid grid-cols-2 gap-6 flex-1 mb-8 min-h-0">
        {/* Hourly */}
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-6 hover:shadow-lg transition-all duration-300 overflow-y-auto max-h-full">
          <h2 className="text-sm uppercase tracking-wider text-stone-600 font-medium mb-6">
            Time for time
          </h2>
          <div className="space-y-4">
            {weather.hourly.map((hour, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/60 transition-colors">
                <span className="text-lg text-stone-900 min-w-[80px]">{hour.time}</span>
                <div className="w-10 h-10">
                  <WeatherIcon symbol={hour.symbol} size={40} />
                </div>
                <span className="text-2xl font-light text-stone-900 min-w-[60px] text-right">{hour.temp}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily */}
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-6 hover:shadow-lg transition-all duration-300 overflow-y-auto max-h-full">
          <h2 className="text-sm uppercase tracking-wider text-stone-600 font-medium mb-6">
            Neste dager
          </h2>
          <div className="space-y-4">
            {weather.daily.map((day, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/60 transition-colors">
                <span className="text-lg text-stone-900 min-w-[100px]">{day.day}</span>
                <div className="w-10 h-10">
                  <WeatherIcon symbol={day.symbol} size={40} />
                </div>
                <div className="flex gap-4 items-center min-w-[120px] justify-end">
                  <span className="text-xl font-medium text-stone-900">{day.high}°</span>
                  <span className="text-xl text-stone-500">{day.low}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}