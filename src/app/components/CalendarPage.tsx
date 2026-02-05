import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(5);

  const events = {
    5: [
      { time: '10:00', title: 'Møte med teamet', owner: 'cornelius', description: 'Ukentlig statusmøte' },
      { time: '14:00', title: 'Lege', owner: 'ida', description: 'Årlig kontroll' },
      { time: '18:30', title: 'Middag', owner: 'ida', description: 'Lage pasta' },
    ],
    6: [
      { time: '09:00', title: 'Frokostmøte', owner: 'cornelius', description: 'Med klienten' },
      { time: '15:00', title: 'Yoga', owner: 'ida', description: 'Yoga i parken' },
    ],
    7: [
      { time: '12:00', title: 'Lunsj med venner', owner: 'cornelius', description: 'På Restaurant Schrøder' },
    ],
  };

  const days = [
    { date: 3, day: 'Man' },
    { date: 4, day: 'Tirs' },
    { date: 5, day: 'Ons' },
    { date: 6, day: 'Tors' },
    { date: 7, day: 'Fre' },
    { date: 8, day: 'Lør' },
    { date: 9, day: 'Søn' },
  ];

  return (
    <div className="h-full p-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-light text-stone-900 mb-2">Kalender</h1>
          <p className="text-xl text-stone-600">Februar 2026</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-12 h-12 rounded-xl bg-white/40 backdrop-blur-sm border border-stone-200/50 hover:bg-white/60 transition-all flex items-center justify-center">
            <ChevronLeft className="w-6 h-6 text-stone-600" />
          </button>
          <button className="w-12 h-12 rounded-xl bg-white/40 backdrop-blur-sm border border-stone-200/50 hover:bg-white/60 transition-all flex items-center justify-center">
            <ChevronRight className="w-6 h-6 text-stone-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-6 flex-1">
        {/* Week View */}
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-200/50 shadow-sm p-6 w-[200px] hover:shadow-lg transition-all duration-300">
          <h2 className="text-sm uppercase tracking-wider text-stone-600 font-medium mb-6">
            Denne uken
          </h2>
          <div className="space-y-2">
            {days.map((day) => (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`w-full p-4 rounded-xl transition-all duration-200 text-left ${
                  selectedDate === day.date
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'hover:bg-white/60 text-stone-700'
                }`}
              >
                <div className="text-xs uppercase tracking-wider opacity-70 mb-1">
                  {day.day}
                </div>
                <div className="text-2xl font-light">{day.date}</div>
                {events[day.date] && (
                  <div className="mt-2 flex gap-1">
                    {events[day.date].map((event, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          event.owner === 'ida' ? 'bg-amber-400' : selectedDate === day.date ? 'bg-white' : 'bg-stone-900'
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
            <h2 className="text-2xl font-light text-stone-900">
              {days.find(d => d.date === selectedDate)?.day} {selectedDate}. februar
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

          {events[selectedDate] ? (
            <div className="space-y-4">
              {events[selectedDate].map((event, i) => (
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
                        <div className="text-base text-stone-600">
                          {event.description}
                        </div>
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