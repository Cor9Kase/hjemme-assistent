import { useState, useEffect } from 'react';

const STOPS = [
  { id: 'NSR:StopPlace:6372', name: 'Adv. Dehlis plass', short: 'ADV. DEHLIS PL.' },
  { id: 'NSR:StopPlace:6366', name: 'Voldsløkka', short: 'VOLDSLØKKA' }
];

interface BusDeparture {
  line: string;
  destination: string;
  mins: number;
  stop: string;
  isSoon: boolean;
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
          headers: { 
            'Content-Type': 'application/json', 
            'ET-Client-Name': 'hjemme-dashboard' 
          },
          body: JSON.stringify({ query })
        });
        const data = await res.json();
        
        let allDepartures: any[] = [];
        STOPS.forEach((s, i) => {
          const stopData = data.data?.[`stop${i}`];
          if (stopData?.estimatedCalls) {
            stopData.estimatedCalls.forEach((d: any) => {
              d.stopShort = s.short;
              allDepartures.push(d);
            });
          }
        });
        
        // Filter relevant lines
        const filtered = allDepartures.filter((d: any) => {
          const line = d.serviceJourney.journeyPattern.line.publicCode;
          const dest = d.destinationDisplay.frontText;
          return (
            (line === '54' && dest === 'Kværnerbyen') || 
            (line === '37' && dest === 'Helsfyr') ||
            (line === '34' && dest === 'Ekeberg hageby')
          );
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
            mins,
            stop: bus.stopShort,
            isSoon: mins <= 5
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
    <div className="h-full p-6 flex flex-col">
      {/* Bus Cards Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {departures.map((bus, i) => (
          <BusCard key={i} bus={bus} />
        ))}
      </div>
    </div>
  );
}

interface BusCardProps {
  bus: BusDeparture;
}

function BusCard({ bus }: BusCardProps) {
  // Determine color based on bus line
  const getBadgeColor = () => {
    if (bus.isSoon) return 'bg-amber-600';
    if (bus.line === '34') return 'bg-blue-600';
    return 'bg-stone-900';
  };
  
  const getTextColor = () => {
    if (bus.isSoon) return 'text-amber-600';
    if (bus.line === '34') return 'text-blue-600';
    return 'text-stone-900';
  };
  
  const getRingColor = () => {
    if (bus.isSoon) return 'ring-amber-500';
    return 'border border-stone-200';
  };

  return (
    <div 
      className={`bg-white rounded-xl p-3 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col ${
        bus.isSoon ? 'ring-2 ring-amber-500' : 'border border-stone-200'
      }`}
    >
      {/* Top section: Badge + Time */}
      <div className="flex items-start justify-between mb-auto">
        {/* Bus number badge */}
        <div 
          className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${getBadgeColor()}`}
        >
          <span className="text-white text-3xl font-bold">{bus.line}</span>
        </div>
        
        {/* Time */}
        <div className="flex-shrink-0 text-right">
          <div className={`text-5xl font-bold leading-none ${getTextColor()}`}>
            {bus.mins}
          </div>
          <div className="text-xs text-stone-600 mt-1">min</div>
        </div>
      </div>
      
      {/* Bottom section: Stop + Destination */}
      <div className="mt-4">
        <div className="text-[9px] text-stone-500 font-medium tracking-wider mb-1.5">
          {bus.stop}
        </div>
        <div className="text-2xl font-semibold text-stone-900 leading-tight">
          {bus.destination}
        </div>
      </div>
    </div>
  );
}