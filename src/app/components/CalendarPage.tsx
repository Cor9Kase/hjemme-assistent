import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API_BASE = '';

interface CalendarEvent {
  time: string;
  title: string;
  owner: string;
  description?: string;
}

interface DayInfo {
  date: number;
  day: string;
  fullDate: string;
  events: CalendarEvent[];
}

export function CalendarPage() {
  const [days, setDays] = useState<DayInfo[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [monthName, setMonthName] = useState('');

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const res = await fetch(`${API_BASE}/events`);
        const events = await res.json();
        
        // Generate 7 days starting from today
        const today = new Date();
        setMonthName(today.toLocaleDateString('no-NO', { month: 'long', year: 'numeric' }));
        
        const weekDays: DayInfo[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          const dateStr = d.toISOString().split('T')[0];
          
          // Filter events for this day
          const dayEvents = events
            .filter((e: any) => {
              const eventDate = new Date(e.start).toISOString().split('T')[0];
              return eventDate === dateStr;
            })
            .map((e: any) => ({
              time: new Date(e.start).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }),
              title: e.oppsummering || e.title || 'Ingen tittel',
              owner: e.organizer_email?.includes('ida') ? 'ida' : 'cornelius',
              description: e.location || ''
            }));
          
          weekDays.push({
            date: d.getDate(),
            day: d.toLocaleDateString('no-NO', { weekday: 'short' }),
            fullDate: d.toLocaleDateString('no-NO', { weekday: 'long', day: 'numeric', month: 'long' }),
            events: dayEvents
          });
        }
        
        setDays(weekDays);
      } catch (e) {
        console.error('Calendar error:', e);
      }
    }
    
    fetchCalendar();
    const interval = setInterval(fetchCalendar, 300000);
    return () => clearInterval(interval);
  }, []);

  const selectedDay = days[selectedIdx];

  return (
    <div className="h-full p-8 flex flex-col">

      <div className="grid grid-cols-[auto_1fr] gap-6 flex-1">
        {/* Week View */}
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-6 w-[200px] hover:shadow-lg transition-all duration-300">
          <h2 className="text-sm uppercase tracking-wider text-stone-600 font-medium mb-6">
            Denne uken
          </h2>
          <div className="space-y-2">
            {days.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={`w-full p-4 rounded-xl transition-all duration-200 text-left ${
                  selectedIdx === idx
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'hover:bg-white/60 text-stone-700'
                }`}
              >
                <div className="text-xs uppercase tracking-wider opacity-70 mb-1">
                  {day.day}
                </div>
                <div className="text-2xl font-light">{day.date}</div>
                {day.events.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {day.events.slice(0, 4).map((event, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          event.owner === 'ida' ? 'bg-amber-400' : selectedIdx === idx ? 'bg-white' : 'bg-stone-900'
                        }`}
                      ></span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Events for selected day */}
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-8 hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-stone-900 capitalize">
              {selectedDay?.fullDate || '--'}
            </h2>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-sm text-stone-600">
                <span className="w-3 h-3 rounded-full bg-stone-900"></span>
                Cornelius
              </span>
              <span className="flex items-center gap-2 text-sm text-stone-600">
                <span className="w-3 h-3 rounded-full bg-amber-600"></span>
                Ida
              </span>
            </div>
          </div>

          {selectedDay?.events && selectedDay.events.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-[400px]">
              {selectedDay.events.map((event, i) => (
                <div
                  key={i}
                  className={`p-6 rounded-2xl border-l-4 transition-all duration-200 hover:bg-white/60 cursor-pointer ${
                    event.owner === 'ida' 
                      ? 'border-amber-600 bg-amber-50/30' 
                      : 'border-stone-900 bg-stone-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-6">
                      <span className="text-3xl font-light text-stone-900 min-w-[90px]">
                        {event.time}
                      </span>
                      <div>
                        <div className="text-xl font-medium text-stone-900 mb-1">
                          {event.title}
                        </div>
                        {event.description && (
                          <div className="text-base text-stone-600">
                            {event.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm ${
                      event.owner === 'ida'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-stone-100 text-stone-900'
                    }`}>
                      {event.owner === 'ida' ? 'Ida' : 'Cornelius'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-stone-400 text-xl">
              Ingen avtaler denne dagen
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
