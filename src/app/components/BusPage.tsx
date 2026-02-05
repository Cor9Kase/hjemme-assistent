import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

const STOPS = [
  { id: 'NSR:StopPlace:6372', name: 'Adv. Dehlis plass', short: 'Adv. Dehlis pl.' },
  { id: 'NSR:StopPlace:6366', name: 'Voldsløkka', short: 'Voldsløkka' }
];

interface BusDeparture {
  line: string;
  destination: string;
  time: string;
  mins: number;
  isSoon: boolean;
  stop: string;
  realTime: boolean;
}

export function BusPage() {
  const [departures, setDepartures] = useState<BusDeparture[]>([]);

  useEffect(() => {
    async function fetchBus() {
      const stopQueries = STOPS.map((s, i) => `
        stop${i}: stopPlace(id: "${s.id}") {
          name
          estimatedCalls(timeRange: 7200, numberOfDepartures: 10) {
            expectedDepartureTime
            destinationDisplay { frontText }
            serviceJourney { journeyPattern { line { publicCode } } }
          }
        }
      `).join('');
      
      const query = `{ ${stopQueries} }`;
      
      try {
        const res = await fetch('https://api.entur.io/journey-planner/v3/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ET-Client-Name': 'hjemme-dashboard' },
          body: JSON.stringify({ query })
        });
        const data = await res.json();
        
        let allDepartures: any[] = [];
        STOPS.forEach((s, i) => {
          const stopData = data.data?.[`stop${i}`];
          if (stopData?.estimatedCalls) {
            stopData.estimatedCalls.forEach((d: any) => {
              d.stopName = stopData.name;
              d.stopShort = s.short;
              allDepartures.push(d);
            });
          }
        });
        
        // Filter relevant lines
        const filtered = allDepartures.filter((d: any) => {
          const line = d.serviceJourney.journeyPattern.line.publicCode;
          const dest = d.destinationDisplay.frontText;
          return (line === '54' && dest === 'Kværnerbyen') || 
                 (line === '37' && dest === 'Helsfyr') ||
                 (line === '34' && dest === 'Ekeberg hageby');
        });
        
        // Sort by time
        filtered.sort((a: any, b: any) => 
          new Date(a.expectedDepartureTime).getTime() - new Date(b.expectedDepartureTime).getTime()
        );
        
        // Filter out buses departing in less than 3 minutes
        const validBuses = filtered.filter((bus: any) => {
          const mins = Math.round((new Date(bus.expectedDepartureTime).getTime() - Date.now()) / 60000);
          return mins >= 3;
        });
        
        const deps = validBuses.slice(0, 6).map((bus: any) => {
          const mins = Math.round((new Date(bus.expectedDepartureTime).getTime() - Date.now()) / 60000);
          return {
            line: bus.serviceJourney.journeyPattern.line.publicCode,
            destination: bus.destinationDisplay.frontText,
            time: `${mins} min`,
            mins,
            isSoon: mins <= 5,
            stop: bus.stopShort,
            realTime: true
          };
        });
        
        setDepartures(deps);
      } catch (e) {
        console.error('Bus error:', e);
      }
    }
    
    fetchBus();
    const interval = setInterval(fetchBus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full p-6 pb-12 flex flex-col overflow-y-auto">
      {/* Departures Grid */}
      <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto">
        {departures.map((bus, i) => (
          <div
            key={i}
            className={`bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-5 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden group ${
              bus.isSoon ? 'ring-2 ring-amber-400' : ''
            }`}
          >
            {/* Hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

            {/* Minutes badge */}
            <div className={`absolute top-4 right-4 flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full ${
              bus.isSoon 
                ? 'text-amber-700 bg-amber-100' 
                : 'text-stone-700 bg-stone-100'
            }`}>
              {bus.mins} min
            </div>

            <div className="relative flex items-center gap-3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-semibold transition-transform duration-300 group-hover:scale-105 ${
                bus.isSoon 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-stone-900 text-white'
              }`}>
                {bus.line}
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-0.5">
                  {bus.stop}
                </div>
                <div className="text-base font-medium text-stone-900 leading-tight">
                  {bus.destination}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-8 text-sm text-stone-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <span>Avgår innen 5 min</span>
        </div>
      </div>
    </div>
  );
}
