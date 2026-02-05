import { Wind, Droplets, Eye } from 'lucide-react';
import { WeatherIcon } from './WeatherIcon';

export function WeatherPage() {
  const weather = {
    temp: 12,
    condition: 'Delvis skyet',
    symbol: 'partlycloudy_day',
    wind: 3.2,
    humidity: 65,
    visibility: 10,
    feelsLike: 11,
    hourly: [
      { time: '14:00', temp: 13, symbol: 'partlycloudy_day' },
      { time: '15:00', temp: 14, symbol: 'fair_day' },
      { time: '16:00', temp: 13, symbol: 'fair_day' },
      { time: '17:00', temp: 12, symbol: 'cloudy' },
      { time: '18:00', temp: 11, symbol: 'cloudy' },
      { time: '19:00', temp: 10, symbol: 'partlycloudy_night' },
    ],
    daily: [
      { day: 'I dag', high: 14, low: 9, symbol: 'partlycloudy_day' },
      { day: 'Fredag', high: 13, low: 8, symbol: 'rain' },
      { day: 'Lørdag', high: 15, low: 10, symbol: 'fair_day' },
      { day: 'Søndag', high: 16, low: 11, symbol: 'fair_day' },
    ]
  };

  return (
    <div className="h-full p-8 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-light text-stone-900 mb-2">Værmelding</h1>
        <p className="text-xl text-stone-600">Oslo, Norge</p>
      </div>

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
      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* Hourly */}
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-6 hover:shadow-lg transition-all duration-300">
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
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-6 hover:shadow-lg transition-all duration-300">
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