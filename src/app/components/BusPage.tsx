import { MapPin, Clock } from 'lucide-react';

export function BusPage() {
  const departures = [
    { 
      line: '54', 
      destination: 'Kværnerbyen', 
      time: '3 min', 
      isSoon: true,
      platform: 'A',
      realTime: true
    },
    { 
      line: '37', 
      destination: 'Helsfyr', 
      time: '8 min', 
      isSoon: false,
      platform: 'B',
      realTime: true
    },
    { 
      line: '34', 
      destination: 'Ekeberg hageby', 
      time: '12 min', 
      isSoon: false,
      platform: 'A',
      realTime: true
    },
    { 
      line: '54', 
      destination: 'Kværnerbyen', 
      time: '18 min', 
      isSoon: false,
      platform: 'A',
      realTime: false
    },
    { 
      line: '37', 
      destination: 'Helsfyr', 
      time: '23 min', 
      isSoon: false,
      platform: 'B',
      realTime: false
    },
    { 
      line: '34', 
      destination: 'Ekeberg hageby', 
      time: '27 min', 
      isSoon: false,
      platform: 'A',
      realTime: true
    },
  ];

  return (
    <div className="h-full p-8 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-light text-stone-900 mb-2">Bussholdeplass</h1>
        <div className="flex items-center gap-2 text-xl text-stone-600">
          <MapPin className="w-5 h-5" />
          <span>Oslo Sentrum</span>
        </div>
      </div>

      {/* Departures Grid */}
      <div className="grid grid-cols-2 gap-6 flex-1">
        {departures.map((bus, i) => (
          <div
            key={i}
            className={`bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-8 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden group ${
              bus.isSoon ? 'ring-2 ring-amber-400' : ''
            }`}
          >
            {/* Hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

            {/* Real-time indicator */}
            {bus.realTime && (
              <div className="absolute top-6 right-6 flex items-center gap-2 text-xs text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                Sanntid
              </div>
            )}

            <div className="relative flex items-center gap-6 mb-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-semibold transition-transform duration-300 group-hover:scale-105 ${
                bus.isSoon 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-stone-900 text-white'
              }`}>
                {bus.line}
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">
                  Plattform {bus.platform}
                </div>
                <div className="text-xl font-medium text-stone-900 leading-tight">
                  {bus.destination}
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-between pt-6 border-t border-stone-200">
              <div className="flex items-center gap-2 text-stone-500">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Avgår om</span>
              </div>
              <div className={`text-4xl font-light ${
                bus.isSoon ? 'text-amber-600' : 'text-stone-900'
              }`}>
                {bus.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-8 text-sm text-stone-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <span>Avgår snart</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
          <span>Sanntidsdata</span>
        </div>
      </div>
    </div>
  );
}